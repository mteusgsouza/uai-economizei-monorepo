"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  Brand as PayloadBrand,
  Category as PayloadCategory,
  Product as PayloadProduct,
} from "@/payload-types";
import { mapBrandDoc, mapCategory, mapProduct } from "@/lib/catalog/map-product";
import type { Brand, CategoryWithSubcategories, Product } from "@/types/product";

interface QueryOptions {
  enabled?: boolean;
}

/**
 * Fetch client-side direto no REST do Payload (mesma origem, /api/*).
 * Usado apenas onde SSR não alcança: wishlist e fallbacks standalone de seções.
 */
async function fetchCatalog<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar catálogo`);
  return (await res.json()) as T;
}

async function fetchProducts(extraParams: Record<string, string>, limit: number) {
  const params = new URLSearchParams({
    depth: "1",
    limit: String(limit),
    sort: "-createdAt",
    "where[active][equals]": "true",
    ...extraParams,
  });
  const data = await fetchCatalog<{ docs: PayloadProduct[] }>(`/products?${params}`);
  return data.docs.map((doc) => mapProduct(doc));
}

export function useProducts(limit = 50, options?: QueryOptions) {
  return useQuery<Product[]>({
    queryKey: ["products", { limit }] as const,
    queryFn: () => fetchProducts({}, limit),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

export function useHomeProducts(limit = 4, options?: QueryOptions) {
  return useQuery<Product[]>({
    queryKey: ["products", "home", { limit }] as const,
    queryFn: () => fetchProducts({}, limit),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/** Últimas entradas do catálogo — mesmo critério de /novidades. */
export function useNewProducts(limit = 50, options?: QueryOptions) {
  return useQuery<Product[]>({
    queryKey: ["products", "new", { limit }] as const,
    // Não filtra por `isNew`: esse campo guarda o estado de conservação
    // (novo/usado), não a data de entrada.
    queryFn: () => fetchProducts({ sort: "-createdAt" }, limit),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

/**
 * Resolve produtos por id — o item do pedido guarda só `productId`, e a tela
 * de pedidos precisa do nome e da figura. Sem filtro de `active`: um produto
 * comprado há meses pode ter saído do ar e ainda assim tem que aparecer.
 */
export function useProductsByIds(ids: number[], options?: QueryOptions) {
  const key = [...new Set(ids)].sort((a, b) => a - b);

  return useQuery<Map<number, Product>>({
    queryKey: ["products", "by-ids", key] as const,
    queryFn: async () => {
      if (key.length === 0) return new Map<number, Product>();
      const params = new URLSearchParams({
        depth: "1",
        limit: String(key.length),
        "where[id][in]": key.join(","),
      });
      const data = await fetchCatalog<{ docs: PayloadProduct[] }>(
        `/products?${params}`,
      );
      return new Map(data.docs.map((doc) => [doc.id, mapProduct(doc)]));
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

export function useCategoryProducts(
  categorySlug: string,
  limit = 4,
  options?: QueryOptions,
) {
  return useQuery<Product[]>({
    queryKey: ["products", "category", categorySlug, { limit }] as const,
    queryFn: () =>
      fetchProducts({ "where[category.categorySlug][equals]": categorySlug }, limit),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

// Nav e filtros precisam da lista completa, mas "completa" não é "sem limite":
// um teto generoso evita que a rota vire amplificador se a tabela crescer
// descontroladamente, e `select` corta os campos que `mapCategory`/`mapBrandDoc`
// não usam (descrições, timestamps de auditoria, etc.).
const CATALOG_LIST_LIMIT = 200;

export function useCategories(options?: QueryOptions) {
  return useQuery<CategoryWithSubcategories[]>({
    queryKey: ["categories"] as const,
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(CATALOG_LIST_LIMIT),
        sort: "title",
        depth: "0",
        "select[title]": "true",
        "select[categorySlug]": "true",
        "select[image]": "true",
        "select[subcategories]": "true",
        "select[createdAt]": "true",
        "select[updatedAt]": "true",
      });
      const data = await fetchCatalog<{ docs: PayloadCategory[] }>(
        `/categories?${params}`,
      );
      return data.docs.map(mapCategory);
    },
    staleTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
}

export function useBrands(options?: QueryOptions) {
  return useQuery<Brand[]>({
    queryKey: ["brands"] as const,
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(CATALOG_LIST_LIMIT),
        sort: "name",
        depth: "0",
        "select[name]": "true",
      });
      const data = await fetchCatalog<{ docs: PayloadBrand[] }>(`/brands?${params}`);
      return data.docs.map(mapBrandDoc);
    },
    staleTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
}
