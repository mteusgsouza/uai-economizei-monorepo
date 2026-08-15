import { unstable_cache } from "next/cache";
import type { Where } from "payload";
import type { Brand, CategoryWithSubcategories } from "@/types/product";
import { mapBrandDoc, mapCategory } from "./map-product";
import { getPayloadClient } from "./payload-client";

// Teto generoso em vez de "todas" (limit: 0): nav/filtros precisam da lista
// completa na prática, mas sem limite a rota vira amplificador se a tabela
// crescer. `select` corta os campos que os mappers não usam.
const CATALOG_LIST_LIMIT = 200;

async function fetchCategories(): Promise<CategoryWithSubcategories[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "categories",
    sort: "title",
    limit: CATALOG_LIST_LIMIT,
    depth: 0,
    select: {
      title: true,
      categorySlug: true,
      image: true,
      subcategories: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return result.docs.map(mapCategory);
}

/** Todas as categorias com subcategorias, ordenadas por título. */
export const getCategories = unstable_cache(fetchCategories, ["catalog-categories"], {
  tags: ["categories"],
  revalidate: 600,
});

/**
 * As marcas que realmente têm produto no ar — não a coleção inteira. Filtrar
 * por uma marca sem produto ativo dá lista vazia, e um filtro que só leva a
 * lugar nenhum não deveria estar na tela.
 */
async function fetchBrands(categorySlug?: string): Promise<Brand[]> {
  const payload = await getPayloadClient();

  const and: Where[] = [{ active: { equals: true } }];
  if (categorySlug) and.push({ "category.categorySlug": { equals: categorySlug } });

  const products = await payload.find({
    collection: "products",
    where: { and },
    limit: 0, // todos os ativos: a lista precisa ser exata, não amostrada
    depth: 1,
    select: { brand: true },
  });

  const seen = new Map<number, Brand>();
  for (const doc of products.docs) {
    if (typeof doc.brand === "object" && doc.brand !== null) {
      seen.set(doc.brand.id, { id: doc.brand.id, name: doc.brand.name });
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Marcas, opcionalmente restritas às que têm produtos na categoria. */
export const getBrands = unstable_cache(
  (categorySlug?: string) => fetchBrands(categorySlug),
  ["catalog-brands"],
  { tags: ["brands", "products"], revalidate: 600 },
);

export interface CategoryCounts {
  /** Produtos ativos por `categorySlug`. */
  byCategory: Record<string, number>;
  total: number;
}

async function fetchCategoryCounts(): Promise<CategoryCounts> {
  const payload = await getPayloadClient();
  const categories = await getCategories();

  // Um COUNT por categoria em vez de paginar o catálogo: são poucas categorias
  // e o número precisa ser exato, não o tamanho de uma amostra.
  const counts = await Promise.all(
    categories.map(async (category) => {
      const { totalDocs } = await payload.count({
        collection: "products",
        where: {
          and: [
            { active: { equals: true } },
            { "category.categorySlug": { equals: category.categorySlug } },
          ],
        },
      });
      return [category.categorySlug, totalDocs] as const;
    }),
  );

  const { totalDocs: total } = await payload.count({
    collection: "products",
    where: { active: { equals: true } },
  });

  return { byCategory: Object.fromEntries(counts), total };
}

/** Contagem de produtos por categoria — alimenta o megamenu e o índice. */
export const getCategoryCounts = unstable_cache(
  fetchCategoryCounts,
  ["catalog-category-counts"],
  { tags: ["products", "categories"], revalidate: 600 },
);

/**
 * Uma varredura só monta o mapa inteiro — são dezenas de subcategorias, e um
 * `COUNT` para cada uma seria dezenas de idas ao banco para somar números que
 * cabem numa passada.
 */
async function fetchSubcategoryCounts(): Promise<Record<string, number>> {
  const payload = await getPayloadClient();

  const products = await payload.find({
    collection: "products",
    where: { active: { equals: true } },
    limit: 0,
    depth: 0,
    select: { subcategory: true },
  });

  const counts: Record<string, number> = {};
  for (const doc of products.docs) {
    if (!doc.subcategory) continue;
    counts[doc.subcategory] = (counts[doc.subcategory] ?? 0) + 1;
  }
  return counts;
}

/**
 * Produtos ativos por `subcatSlug`, de todas as categorias. Alimenta a faixa
 * da listagem e a árvore de filtros — que escondem o que está em zero, para
 * não oferecer caminho sem saída.
 */
export const getSubcategoryCounts = unstable_cache(
  fetchSubcategoryCounts,
  ["catalog-subcategory-counts"],
  { tags: ["products", "categories"], revalidate: 600 },
);
