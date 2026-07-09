"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/http-client";
import type { Product } from "@/types/product";

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
