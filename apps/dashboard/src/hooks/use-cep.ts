import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

export interface CepShipping {
  id: number;
  cepInicial: number;
  cepFinal: number;
  descricao: string;
  valor: number;
}

export interface CepFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function useCep(filters: CepFilters = {}) {
  return useQuery({
    queryKey: ["cep", filters] as const,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      const qs = params.toString();
      return api.get<CepShipping[]>(`/cep${qs ? `?${qs}` : ""}`);
    },
    staleTime: 5 * 60 * 1000,
  });
}
