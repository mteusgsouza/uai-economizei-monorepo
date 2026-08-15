import { normalizeName } from './normalize-name';
import type { PayloadProductRef } from './sync.types';

const PAYLOAD_API = process.env.PAYLOAD_API_URL ?? 'http://localhost:3000/api';

/**
 * Escrever no Payload exige a chave interna: `Products.access.update` aceita
 * admin logado **ou** `x-internal-key` (ver
 * `apps/front/src/access/internal-key.ts`). Sem o header o PATCH volta 403.
 */
function writeHeaders(): Record<string, string> {
  const internalKey = process.env.INTERNAL_API_KEY;
  return {
    'Content-Type': 'application/json',
    ...(internalKey ? { 'x-internal-key': internalKey } : {}),
  };
}

/** Taxonomia do Payload indexada pelos títulos que o Firestore usa. */
export interface CategoryIndex {
  /** Título normalizado da categoria -> id no Payload. */
  categoryIdByTitle: Map<string, number>;
  /** `${categoryId}|${título normalizado da subcategoria}` -> `subcatSlug`. */
  subSlugByCategoryAndTitle: Map<string, string>;
}

export async function fetchCategoryIndex(): Promise<CategoryIndex> {
  const res = await fetch(`${PAYLOAD_API}/categories?limit=0&depth=0`);
  const data = (await res.json()) as {
    docs: Array<{
      id: number;
      title: string;
      subcategories?: Array<{ title: string; subcatSlug: string }>;
    }>;
  };

  const categoryIdByTitle = new Map<string, number>();
  const subSlugByCategoryAndTitle = new Map<string, string>();

  for (const category of data.docs) {
    categoryIdByTitle.set(normalizeName(category.title), category.id);
    for (const sub of category.subcategories ?? []) {
      subSlugByCategoryAndTitle.set(
        `${category.id}|${normalizeName(sub.title)}`,
        sub.subcatSlug,
      );
    }
  }

  return { categoryIdByTitle, subSlugByCategoryAndTitle };
}

/**
 * Produtos do Payload agrupados por nome normalizado. Nomes repetem no catálogo
 * (reimportações), então cada chave guarda uma lista.
 */
export async function fetchProductsByName(): Promise<
  Map<string, PayloadProductRef[]>
> {
  const res = await fetch(`${PAYLOAD_API}/products?limit=0&depth=0`);
  const data = (await res.json()) as {
    docs: Array<{
      id: number;
      name: string;
      price: number;
      category?: number | { id: number } | null;
      subcategory?: string | null;
    }>;
  };

  const index = new Map<string, PayloadProductRef[]>();
  for (const doc of data.docs) {
    const key = normalizeName(doc.name ?? '');
    const categoryId =
      typeof doc.category === 'number'
        ? doc.category
        : (doc.category?.id ?? null);

    if (!index.has(key)) index.set(key, []);
    index.get(key)!.push({
      id: doc.id,
      name: doc.name,
      price: doc.price,
      categoryId,
      subcategory: doc.subcategory ?? null,
    });
  }

  return index;
}

/**
 * Aplica o PATCH e **falha alto** em resposta não-ok: sem essa checagem um 403
 * do Payload virava "atualizado" no relatório, escondendo que nada foi escrito.
 */
export async function patchProduct(
  id: number,
  data: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${PAYLOAD_API}/products/${id}`, {
    method: 'PATCH',
    headers: writeHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PATCH ${res.status}: ${body.slice(0, 300)}`);
  }
}
