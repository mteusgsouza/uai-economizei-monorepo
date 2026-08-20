"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export const addressSchema = z.object({
  postalCode: z.string().min(8, "CEP obrigatorio"),
  street: z.string().min(3, "Rua obrigatoria"),
  number: z.string().min(1, "Numero obrigatorio"),
  // Sempre presente no formulário (vazio quando não informado), e sem
  // mínimo: complemento é opcional para o cliente, não para o tipo.
  complement: z.string(),
  neighborhood: z.string().min(2, "Bairro obrigatorio"),
  city: z.string().min(2, "Cidade obrigatoria"),
  state: z.string().min(2, "Estado obrigatorio"),
  country: z.string().min(2, "Pais obrigatorio"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

/**
 * O formulário de endereço com o schema ligado como validador — sem isso dava
 * para fechar pedido de entrega com os campos em branco.
 *
 * Mora fora do componente para que `AddressFields` importe o tipo da API do
 * formulário sem depender do componente que o renderiza.
 */
export function useAddressForm(
  defaultValues: Partial<AddressFormValues> | undefined,
  onSubmit: (values: AddressFormValues) => void,
) {
  return useForm({
    defaultValues: {
      postalCode: defaultValues?.postalCode ?? "",
      street: defaultValues?.street ?? "",
      number: defaultValues?.number ?? "",
      complement: defaultValues?.complement ?? "",
      neighborhood: defaultValues?.neighborhood ?? "",
      city: defaultValues?.city ?? "",
      state: defaultValues?.state ?? "",
      country: defaultValues?.country ?? "Brasil",
    },
    validators: { onSubmit: addressSchema },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });
}

export type AddressFormApi = ReturnType<typeof useAddressForm>;
