import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface Publisher {
  id: number;
  name: string;
  category: string;
}

export function usePublishers() {
  return useQuery({
    queryKey: ["publishers"] as const,
    queryFn: () => api.get<Publisher[]>("/publishers"),
    staleTime: 5 * 60 * 1000,
  });
}
