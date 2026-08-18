import type { AddressFormValues } from "@/components/checkout/address-form";
import type { CustomerAddress } from "@/types/order";

/**
 * Qualquer coisa com cara de endereço — o salvo na conta, a cópia gravada no
 * pedido ou o que o admin recebe da Nest. Todos os campos são opcionais porque
 * o snapshot de pedidos antigos pode vir incompleto.
 */
export interface AddressLike {
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

/**
 * O endereço quebrado nas linhas de um envelope, pulando o que não veio:
 * rua e número (com complemento), bairro e cidade/UF, CEP.
 */
export function addressLines(address: AddressLike): string[] {
  const street = [address.street, address.number].filter(Boolean).join(", ");
  const cityState = [address.city, address.state].filter(Boolean).join(" / ");

  return [
    [street, address.complement].filter(Boolean).join(" — "),
    [address.neighborhood, cityState].filter(Boolean).join(" · "),
    address.postalCode,
  ].filter((line): line is string => Boolean(line));
}

/**
 * O endereço salvo no formato que o formulário entende: sem `null` e com o país
 * por extenso — o banco guarda o default "BR", o formulário trabalha com
 * "Brasil". A chave de deduplicação da Nest ignora o país justamente por isso.
 */
export function toAddressFormValues(address: CustomerAddress): AddressFormValues {
  return {
    postalCode: address.postalCode,
    street: address.street,
    number: address.number ?? "",
    complement: address.complement ?? "",
    neighborhood: address.neighborhood ?? "",
    city: address.city,
    state: address.state,
    country: address.country === "BR" ? "Brasil" : address.country,
  };
}
