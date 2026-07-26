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

export function useNewProducts(limit = 50, options?: QueryOptions) {
  return useQuery<Product[]>({
    queryKey: ["products", "new", { limit }] as const,
    queryFn: () => fetchProducts({ "where[isNew][not_equals]": "false" }, limit),
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

export function useCategories(options?: QueryOptions) {
  return useQuery<CategoryWithSubcategories[]>({
    queryKey: ["categories"] as const,
    queryFn: async () => {
      const data = await fetchCatalog<{ docs: PayloadCategory[] }>(
        "/categories?limit=0&sort=title&depth=0",
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
      const data = await fetchCatalog<{ docs: PayloadBrand[] }>(
        "/brands?limit=0&sort=name&depth=0",
      );
      return data.docs.map(mapBrandDoc);
    },
    staleTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
}
