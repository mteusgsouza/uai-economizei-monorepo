"use client";

import { useCallback, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { z } from "zod";
import { useCepLookup } from "@/hooks/use-cep-lookup";
import { formatCep, type CepAddress } from "@/lib/viacep";

export const addressSchema = z.object({
  postalCode: z.string().min(8, "CEP obrigatorio"),
  street: z.string().min(3, "Rua obrigatoria"),
  number: z.string().min(1, "Numero obrigatorio"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatorio"),
  city: z.string().min(2, "Cidade obrigatoria"),
  state: z.string().min(2, "Estado obrigatorio"),
  country: z.string().min(2, "Pais obrigatorio"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

interface AddressFormProps {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  /** Informa o CEP digitado para quem calcula o frete. */
  onCepChange?: (cep: string) => void;
  children?: React.ReactNode;
}

export function AddressForm({
  defaultValues,
  onSubmit,
  onCepChange,
  children,
}: AddressFormProps) {
  const form = useForm({
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
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

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

  const { status: cepStatus, lockedFields, message: cepMessage } = useCepLookup({
    cep,
    onFound: fillFromCep,
    onClear: clearFromCep,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <form.Field name="postalCode">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>CEP</Label>
              <div className="relative">
                <Input
                  id={field.name}
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                  value={field.state.value}
                  onChange={(e) => {
                    const masked = formatCep(e.target.value);
                    field.handleChange(masked);
                    setCep(masked);
                    onCepChange?.(masked);
                  }}
                />
                {cepStatus === "loading" && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-steel" />
                )}
              </div>
            </div>
          )}
        </form.Field>

        {cepMessage && (
          <p
            className="self-end text-sm text-steel sm:col-span-2"
            role={cepStatus === "loading" ? undefined : "alert"}
          >
            {cepMessage}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="street">
          {(field) => (
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor={field.name}>Rua</Label>
              <Input
                id={field.name}
                placeholder="Nome da rua"
                value={field.state.value}
                readOnly={lockedFields.street}
                aria-readonly={lockedFields.street}
                className={lockedFields.street ? "bg-canvas text-steel" : undefined}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="number">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Numero</Label>
              <Input
                id={field.name}
                placeholder="123"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="complement">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Complemento</Label>
              <Input
                id={field.name}
                placeholder="Apto, bloco, etc."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="neighborhood">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Bairro</Label>
            <Input
              id={field.name}
              placeholder="Bairro"
              value={field.state.value}
              readOnly={lockedFields.neighborhood}
              aria-readonly={lockedFields.neighborhood}
              className={lockedFields.neighborhood ? "bg-canvas text-steel" : undefined}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <form.Field name="city">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Cidade</Label>
              <Input
                id={field.name}
                placeholder="Cidade"
                value={field.state.value}
                readOnly={lockedFields.city}
                aria-readonly={lockedFields.city}
                className={lockedFields.city ? "bg-canvas text-steel" : undefined}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="state">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Estado</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
                disabled={lockedFields.state}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="country">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Pais</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      {children}
    </form>
  );
}
