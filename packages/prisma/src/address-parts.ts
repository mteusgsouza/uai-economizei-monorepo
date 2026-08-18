/**
 * O endereço como valor: o formato mínimo que identifica uma entrega, sem id nem
 * dono. Serve para calcular o `fingerprint` e para aplicar um PATCH parcial.
 */
export interface AddressParts {
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  postalCode: string;
}

/** Espaços das pontas fora, espaços do meio colapsados. */
function normalize(value?: string | null): string {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

/**
 * Identidade normalizada do endereço, usada como chave de deduplicação
 * (`@@unique([customerId, fingerprint])`).
 *
 * O `country` fica de fora de propósito: o formulário do site manda "Brasil" e a
 * importação do Firebase gravou o default "BR" — é o mesmo país, não pode virar
 * duas linhas.
 *
 * O SQL da migration `..._address_dedupe_default` espelha esta função campo a
 * campo. Mexeu aqui, mexeu lá — senão o índice único passa a discordar do que a
 * aplicação considera duplicado.
 */
export function addressFingerprint(address: AddressParts): string {
  return [
    (address.postalCode ?? '').replace(/\D/g, ''),
    normalize(address.street),
    normalize(address.number),
    normalize(address.complement),
    normalize(address.neighborhood),
    normalize(address.city),
    normalize(address.state),
  ]
    .join('|')
    .toLowerCase();
}

/** O que não veio no corpo do PATCH continua valendo o que está salvo. */
export function mergeAddressParts(
  current: AddressParts,
  patch: Partial<AddressParts>,
): AddressParts {
  return {
    street: patch.street ?? current.street,
    number: patch.number ?? current.number,
    complement: patch.complement ?? current.complement,
    neighborhood: patch.neighborhood ?? current.neighborhood,
    city: patch.city ?? current.city,
    state: patch.state ?? current.state,
    postalCode: patch.postalCode ?? current.postalCode,
  };
}
