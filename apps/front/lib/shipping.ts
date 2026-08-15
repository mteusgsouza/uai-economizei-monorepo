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

/**
 * Quanto esperar pela API antes de desistir. Sem isso, uma API fora do ar
 * deixa a tela em "Consultando…" para sempre — o cliente não descobre que
 * falhou, só que nada acontece.
 */
const TIMEOUT_MS = 8000;

/** Consulta o frete da faixa que contém o CEP (tabela de fretes da loja). */
export async function lookupShipping(cep: string): Promise<ShippingQuote> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return { status: "idle" };

  try {
    // `fetch` direto em vez do HttpClient: a rota é pública e o que importa
    // aqui é poder abortar.
    const res = await fetch(`/bff/cep/lookup?cep=${digits}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { status: "error" };

    const data = (await res.json()) as LookupResponse;
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
