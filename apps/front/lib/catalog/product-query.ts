import type { Where } from "payload";
import { AVAILABLE } from "./filters";

/** Filtros e ordenação da vitrine. O termo buscado vive em `ListingQuery`. */
export interface ProductQuery {
  page?: number;
  limit?: number;
  categorySlug?: string;
  brandName?: string;
  /** Várias subcategorias somam dentro da categoria (OU entre elas). */
  subcategorySlugs?: string[];
  precoMin?: number;
  precoMax?: number;
  /** Estado de conservação: `true` só novos, `false` só usados. */
  isNew?: boolean;
  /** Só produtos que entram no desconto à vista. */
  pixDiscount?: boolean;
  /** Só produtos com desconto no preço. */
  onSale?: boolean;
  sortBy?: "name" | "value" | "stock" | "discount";
  sortOrder?: "asc" | "desc";
}

export function buildWhere(query: ProductQuery): Where {
  const and: Where[] = [...AVAILABLE];

  if (query.precoMin !== undefined) and.push({ price: { greater_than_equal: query.precoMin } });
  if (query.precoMax !== undefined) and.push({ price: { less_than_equal: query.precoMax } });
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

export function buildSort(query: ProductQuery): string {
  if (query.sortBy === "name") return query.sortOrder === "desc" ? "-name" : "name";
  if (query.sortBy === "value") return query.sortOrder === "desc" ? "-price" : "price";
  if (query.sortBy === "stock") return query.sortOrder === "desc" ? "-stock" : "stock";
  // "Maior desconto" ordena pela porcentagem, não pelo valor economizado.
  if (query.sortBy === "discount") return "-discountPercent";
  return "-createdAt";
}
