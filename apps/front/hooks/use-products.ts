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

export function useBrands() {
  return useQuery({
    queryKey: ["brands"] as const,
    queryFn: () => api.get<Brand[]>("/brands"),
    staleTime: 10 * 60 * 1000,
  });
}
