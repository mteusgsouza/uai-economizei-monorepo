import type { Firestore } from 'firebase-admin/firestore';
import { normalizeName } from './normalize-name';
import {
  fetchCategoryIndex,
  fetchProductsByName,
  patchProduct,
} from './payload-catalog';
import type { PayloadProductRef, SyncSubcategoriesResult } from './sync.types';

/** Taxonomia como o Firestore guarda dentro do produto. */
interface FirestoreTaxonomy {
  categoryTitle: string;
  subcategoryTitle: string;
}

function readTaxonomy(data: FirebaseFirestore.DocumentData): FirestoreTaxonomy {
  const category = data.category as
    | { category?: string; subcategory?: string }
    | undefined;
  return {
    categoryTitle: category?.category ?? '',
    subcategoryTitle: category?.subcategory ?? '',
  };
}

/**
 * Preenche `products.subcategory` a partir do Firestore. A relação com
 * `category` já veio correta da importação original — só o slug da subcategoria
 * nunca foi migrado (ver
 * `apps/front/migrations/20260726_200500_products_subcategory_slug.ts`).
 *
 * Idempotente: só faz PATCH quando o slug resolvido difere do que está salvo.
 * Nunca mexe em `category` — divergência é reportada, não corrigida às cegas.
 */
export async function syncSubcategories(
  firestore: Firestore,
): Promise<SyncSubcategoriesResult> {
  const result: SyncSubcategoriesResult = {
    updated: 0,
    unchanged: 0,
    notFoundInFirestore: 0,
    categoryMismatch: 0,
    subcategoryNotFound: 0,
    errors: 0,
    details: [],
  };

  const { categoryIdByTitle, subSlugByCategoryAndTitle } =
    await fetchCategoryIndex();
  const productsByName = await fetchProductsByName();
  const snapshot = await firestore.collection('products').get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const firebaseName = (data.name as string) ?? '';
    const { categoryTitle, subcategoryTitle } = readTaxonomy(data);

    if (!firebaseName || !subcategoryTitle) continue;

    const matched = productsByName.get(normalizeName(firebaseName)) ?? [];

    if (matched.length === 0) {
      result.notFoundInFirestore++;
      result.details.push({
        firebaseName,
        productId: 0,
        status: 'not_found_in_firestore',
      });
      continue;
    }

    const categoryId = categoryIdByTitle.get(normalizeName(categoryTitle));
    const slug = categoryId
      ? subSlugByCategoryAndTitle.get(
          `${categoryId}|${normalizeName(subcategoryTitle)}`,
        )
      : undefined;

    for (const product of matched) {
      await applyToProduct(product, { categoryId, slug, firebaseName }, result);
    }
  }

  return result;
}

async function applyToProduct(
  product: PayloadProductRef,
  resolved: { categoryId?: number; slug?: string; firebaseName: string },
  result: SyncSubcategoriesResult,
): Promise<void> {
  const { categoryId, slug, firebaseName } = resolved;
  const entry = { firebaseName, productId: product.id };

  if (!categoryId || product.categoryId !== categoryId) {
    result.categoryMismatch++;
    result.details.push({ ...entry, status: 'category_mismatch' });
    return;
  }

  if (!slug) {
    result.subcategoryNotFound++;
    result.details.push({ ...entry, status: 'subcategory_not_found' });
    return;
  }

  if (product.subcategory === slug) {
    result.unchanged++;
    result.details.push({ ...entry, status: 'unchanged', subcategory: slug });
    return;
  }

  try {
    await patchProduct(product.id, { subcategory: slug });
    result.updated++;
    result.details.push({ ...entry, status: 'updated', subcategory: slug });
  } catch (err: unknown) {
    result.errors++;
    result.details.push({
      ...entry,
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
