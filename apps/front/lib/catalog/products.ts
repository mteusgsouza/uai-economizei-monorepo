import { unstable_cache } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Product as PayloadProduct } from "@/payload-types";
import type { Product } from "@/types/product";
import { mapProduct } from "./map-product";
import { getPayloadClient } from "./payload-client";
import { buildSort, buildWhere, type ProductQuery } from "./product-query";

export type { ProductQuery } from "./product-query";

export interface ProductListResult {
  docs: Product[];
  totalDocs: number;
  totalPages: number;
  page: number;
}

/** Página do Payload no formato da vitrine. */
export function toListResult(result: PaginatedDocs<PayloadProduct>): ProductListResult {
  return {
    docs: result.docs.map((doc) => mapProduct(doc)),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? 1,
  };
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

  return toListResult(result);
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
