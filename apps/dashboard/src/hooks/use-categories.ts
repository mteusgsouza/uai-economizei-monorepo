import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface Category {
  id: number;
  title: string;
  categorySlug: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"] as const,
    queryFn: () => api.get<Category[]>("/categories"),
    staleTime: 5 * 60 * 1000,
  });
}
