"use client";

import { useForm } from "@tanstack/react-form";
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
  children?: React.ReactNode;
}

export function AddressForm({ defaultValues, onSubmit, children }: AddressFormProps) {
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
              <Input
                id={field.name}
                placeholder="00000-000"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
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
