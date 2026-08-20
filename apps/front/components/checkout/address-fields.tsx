"use client";

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
import type { CepLookupState } from "@/hooks/use-cep-lookup";
import { formatCep } from "@/lib/viacep";
import { AddressTextField, FieldError } from "./address-text-field";
import type { AddressFormApi } from "./use-address-form";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

interface AddressFieldsProps {
  form: AddressFormApi;
  cep: CepLookupState;
  /** Repassa o CEP mascarado para quem calcula o frete. */
  onCepChange: (masked: string) => void;
}

export function AddressFields({ form, cep, onCepChange }: AddressFieldsProps) {
  const { lockedFields, status, message } = cep;

  return (
    <>
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
                    onCepChange(masked);
                  }}
                />
                {status === "loading" && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-steel" />
                )}
              </div>
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        {message && (
          <p
            className="self-end text-sm text-steel sm:col-span-2"
            role={status === "loading" ? undefined : "alert"}
          >
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AddressTextField
          form={form}
          name="street"
          label="Rua"
          placeholder="Nome da rua"
          locked={lockedFields.street}
          className="sm:col-span-2"
        />
        <AddressTextField form={form} name="number" label="Numero" placeholder="123" />
        <AddressTextField
          form={form}
          name="complement"
          label="Complemento"
          placeholder="Apto, bloco, etc."
        />
      </div>

      <AddressTextField
        form={form}
        name="neighborhood"
        label="Bairro"
        placeholder="Bairro"
        locked={lockedFields.neighborhood}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AddressTextField
          form={form}
          name="city"
          label="Cidade"
          placeholder="Cidade"
          locked={lockedFields.city}
        />

        <form.Field name="state">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Estado</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v)}
                disabled={lockedFields.state}
              >
                <SelectTrigger
                  id={field.name}
                  // Travado pelo CEP: mesmo fundo dos campos vizinhos, sem o
                  // esmaecido do disabled — eles usam readOnly e nao apagam.
                  className={lockedFields.state ? "bg-canvas disabled:opacity-100" : undefined}
                >
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
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <AddressTextField form={form} name="country" label="Pais" />
      </div>
    </>
  );
}
