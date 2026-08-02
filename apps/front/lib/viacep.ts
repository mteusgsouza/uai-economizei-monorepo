export interface CepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type CepLookup =
  | { status: "found"; address: CepAddress }
  | { status: "not-found" }
  | { status: "error" };

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

/** Só os dígitos — o campo aceita "00000-000". */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isCompleteCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

/**
 * Consulta o ViaCEP.
 *
 * Atenção: para CEP inexistente ele responde **200 com `{ erro: true }`** —
 * olhar só o status HTTP deixaria o formulário travado com campos vazios.
 */
export async function lookupCep(cep: string, signal?: AbortSignal): Promise<CepLookup> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return { status: "not-found" };

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal });
    if (!res.ok) return { status: "error" };

    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) return { status: "not-found" };

    return {
      status: "found",
      address: {
        street: data.logradouro ?? "",
        neighborhood: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      },
    };
  } catch {
    // Inclui o abort de uma consulta antiga — quem chama decide o que fazer
    return { status: "error" };
  }
}
