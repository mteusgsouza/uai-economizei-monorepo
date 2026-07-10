import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface Brand {
  id: number;
  name: string;
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"] as const,
    queryFn: () => api.get<Brand[]>("/brands"),
    staleTime: 5 * 60 * 1000,
  });
}
