"use client";

import { useCallback, useState } from "react";
import { useCepLookup } from "@/hooks/use-cep-lookup";
import type { CepAddress } from "@/lib/viacep";
import { AddressFields } from "./address-fields";
import { useAddressForm, type AddressFormValues } from "./use-address-form";

export { addressSchema, type AddressFormValues } from "./use-address-form";

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  /** Informa o CEP digitado para quem calcula o frete. */
  onCepChange?: (cep: string) => void;
  children?: React.ReactNode;
}

/**
 * O endereço de entrega. A validação vive no `useAddressForm`; aqui ficam a
 * consulta ao ViaCEP e o encaixe dos campos no `<form>`.
 */
export function AddressForm({
  defaultValues,
  onSubmit,
  onCepChange,
  children,
}: AddressFormProps) {
  const form = useAddressForm(defaultValues, onSubmit);
  const [cep, setCep] = useState(defaultValues?.postalCode ?? "");

  const fillFromCep = useCallback(
    (address: CepAddress) => {
      // Só sobrescreve o que veio preenchido do ViaCEP
      if (address.street) form.setFieldValue("street", address.street);
      if (address.neighborhood) form.setFieldValue("neighborhood", address.neighborhood);
      if (address.city) form.setFieldValue("city", address.city);
      if (address.state) form.setFieldValue("state", address.state);
    },
    [form],
  );

  const clearFromCep = useCallback(() => {
    form.setFieldValue("street", "");
    form.setFieldValue("neighborhood", "");
    form.setFieldValue("city", "");
    form.setFieldValue("state", "");
  }, [form]);

  const lookup = useCepLookup({ cep, onFound: fillFromCep, onClear: clearFromCep });

  const handleCepChange = useCallback(
    (masked: string) => {
      setCep(masked);
      onCepChange?.(masked);
    },
    [onCepChange],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-5"
    >
      <AddressFields form={form} cep={lookup} onCepChange={handleCepChange} />
      {children}
    </form>
  );
}
