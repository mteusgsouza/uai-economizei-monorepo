import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface Category {
  id: number;
  title: string;
  categorySlug: string;
  image?: string | null;
  subcategories?: { id: number; title: string; subcatSlug: string }[];
}

export interface CategoryFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useCategories(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: ["categories", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<Category[]>(`/categories${qs ? `?${qs}` : ""}`);
    },
    staleTime: 5 * 60 * 1000,
  });
}
