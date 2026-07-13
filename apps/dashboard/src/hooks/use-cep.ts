import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http-client";

interface CepShipping {
  id: number;
  cepInicial: number;
  cepFinal: number;
  descricao: string;
  valor: number;
}

export function useCep() {
  return useQuery({
    queryKey: ["cep"] as const,
    queryFn: () => api.get<CepShipping[]>("/cep"),
    staleTime: 5 * 60 * 1000,
  });
}
