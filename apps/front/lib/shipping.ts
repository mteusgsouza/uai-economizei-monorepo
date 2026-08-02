import { api } from "@/lib/http-client";
import { onlyDigits } from "@/lib/viacep";

export type ShippingQuote =
  | { status: "idle" }
  | { status: "loading" }
  /** CEP atendido: valor em centavos, como o preço dos produtos. */
  | { status: "available"; value: number; description: string }
  /** CEP fora das faixas cadastradas — não entregamos ali. */
  | { status: "unavailable" }
  | { status: "error" };

interface LookupResponse {
  found: boolean;
  valor?: number;
  descricao?: string;
}

/** Consulta o frete da faixa que contém o CEP (tabela de fretes da loja). */
export async function lookupShipping(cep: string): Promise<ShippingQuote> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return { status: "idle" };

  try {
    const data = await api.get<LookupResponse>(`/cep/lookup?cep=${digits}`);
    if (!data.found || data.valor === undefined) return { status: "unavailable" };

    return {
      status: "available",
      value: data.valor,
      description: data.descricao ?? "Entrega",
    };
  } catch {
    return { status: "error" };
  }
}
