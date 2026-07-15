"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/http-client";
import type { Product, Brand, CategoryWithSubcategories } from "@/types/product";

export function useProducts() {
  return useQuery({
    queryKey: ["products"] as const,
    queryFn: () => api.get<Product[]>("/products"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["products", id] as const,
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: id > 0,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"] as const,
    queryFn: () => api.get<CategoryWithSubcategories[]>("/categories"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrands(categorySlug?: string) {
  return useQuery({
    queryKey: ["brands", { categorySlug }] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (categorySlug) params.set("categorySlug", categorySlug);
      const qs = params.toString();
      return api.get<Brand[]>(`/brands${qs ? `?${qs}` : ""}`);
    },
    staleTime: 10 * 60 * 1000,
  });
}

export interface ProductFilters {
  categoria?: string;
  marca?: string;
  subcategoryId?: number;
  precoMin?: number;
  precoMax?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useFilteredProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.categoria) params.set("categorySlug", filters.categoria);
      if (filters.marca) params.set("brandName", filters.marca);
      if (filters.subcategoryId !== undefined) params.set("subcategoryId", String(filters.subcategoryId));
      if (filters.precoMin !== undefined) params.set("precoMin", String(filters.precoMin));
      if (filters.precoMax !== undefined) params.set("precoMax", String(filters.precoMax));
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<Product[]>(`/products${qs ? `?${qs}` : ""}`);
    },
    staleTime: 5 * 60 * 1000,
  });
}
