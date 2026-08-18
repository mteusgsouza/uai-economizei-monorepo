import { unstable_cache } from "next/cache";
import type { Where } from "payload";
import type { Product } from "@/types/product";
import { mapProduct } from "./map-product";
import { getPayloadClient } from "./payload-client";

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  brandName?: string;
  /** Várias subcategorias somam dentro da categoria (OU entre elas). */
  subcategorySlugs?: string[];
  precoMin?: number;
  precoMax?: number;
  inStock?: boolean;
  /** Estado de conservação: `true` só novos, `false` só usados. */
  isNew?: boolean;
  /** Só produtos que entram no desconto à vista. */
  pixDiscount?: boolean;
  /** Só produtos com desconto no preço. */
  onSale?: boolean;
  sortBy?: "name" | "value" | "stock" | "discount";
  sortOrder?: "asc" | "desc";
}

export interface ProductListResult {
  docs: Product[];
  totalDocs: number;
  totalPages: number;
  page: number;
}

function buildWhere(query: ProductQuery): Where {
  const and: Where[] = [{ active: { equals: true } }];

  if (query.search) and.push({ name: { like: query.search.trim() } });
  if (query.precoMin !== undefined) and.push({ price: { greater_than_equal: query.precoMin } });
  if (query.precoMax !== undefined) and.push({ price: { less_than_equal: query.precoMax } });
  if (query.inStock) and.push({ stock: { greater_than: 0 } });
  // `undefined` não filtra; `false` precisa filtrar por usados, daí o teste
  // explícito em vez de `if (query.isNew)`.
  if (query.isNew !== undefined) and.push({ isNew: { equals: query.isNew } });
  if (query.pixDiscount) and.push({ pixDiscount: { equals: true } });
  if (query.onSale) and.push({ discountPercent: { greater_than: 0 } });
  if (query.subcategorySlugs?.length) {
    and.push({ subcategory: { in: query.subcategorySlugs } });
  }
  // Filtros por campo do relacionamento — uma única query com join no Local API
  if (query.categorySlug) and.push({ "category.categorySlug": { equals: query.categorySlug } });
  if (query.brandName) and.push({ "brand.name": { like: query.brandName } });

  return { and };
}

function buildSort(query: ProductQuery): string {
  if (query.sortBy === "name") return query.sortOrder === "desc" ? "-name" : "name";
  if (query.sortBy === "value") return query.sortOrder === "desc" ? "-price" : "price";
  if (query.sortBy === "stock") return query.sortOrder === "desc" ? "-stock" : "stock";
  // "Maior desconto" ordena pela porcentagem, não pelo valor economizado.
  if (query.sortBy === "discount") return "-discountPercent";
  return "-createdAt";
}

async function fetchProducts(query: ProductQuery): Promise<ProductListResult> {
  const payload = await getPayloadClient();

  const result = await payload.find({
    collection: "products",
    where: buildWhere(query),
    sort: buildSort(query),
    page: query.page ?? 1,
    limit: query.limit ?? 24,
    depth: 1,
  });

  return {
    docs: result.docs.map((doc) => mapProduct(doc)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? 1,
  };
}

/** Listagem pública de produtos, cacheada por 5 min e invalidada pela tag `products`. */
export const getProducts = unstable_cache(
  (query: ProductQuery) => fetchProducts(query),
  ["catalog-products"],
  { tags: ["products", "brands", "categories"], revalidate: 300 },
);

async function fetchProduct(id: number): Promise<Product | null> {
  const payload = await getPayloadClient();
  try {
    const doc = await payload.findByID({ collection: "products", id, depth: 1 });
    if (!doc.active) return null;
    return mapProduct(doc, true);
  } catch {
    return null;
  }
}

/** Detalhe do produto (inclui description_html). */
export const getProduct = unstable_cache(
  (id: number) => fetchProduct(id),
  ["catalog-product"],
  { tags: ["products"], revalidate: 300 },
);
