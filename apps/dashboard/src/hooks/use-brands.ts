import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface Brand {
  id: number;
  name: string;
}

export interface BrandFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useBrands(filters: BrandFilters = {}) {
  return useQuery({
    queryKey: ["brands", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<Brand[]>(`/brands${qs ? `?${qs}` : ""}`);
    },
    staleTime: 5 * 60 * 1000,
  });
}
