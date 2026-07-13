import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

export interface ProductFilters {
  search?: string;
  brandId?: number;
  categoryId?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface ProductImage {
  name: string;
  url: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  isNew: string | null;
  value: number;
  stock: number;
  productMainImg: string;
  productImages: ProductImage[];
  brand: { id: number; name: string };
  category: { id: number; title: string; categorySlug: string };
}

export function useProductsAdmin(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", "admin", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.brandId) params.set("brandId", String(filters.brandId));
      if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<ProductListItem[]>(
        `/products/admin${qs ? `?${qs}` : ""}`,
      );
    },
    staleTime: 2 * 60 * 1000,
  });
}
