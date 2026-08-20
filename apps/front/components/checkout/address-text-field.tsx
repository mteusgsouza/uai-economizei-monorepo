"use client";

import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import type { AddressFormApi } from "./use-address-form";

/** Mensagem do schema, sob o campo que a gerou. */
export function FieldError({ errors }: { errors: unknown[] }) {
  const first = errors.find(Boolean);
  if (!first) return null;

  const message =
    typeof first === "object" && first !== null && "message" in first
      ? String((first as { message: unknown }).message)
      : String(first);

  return (
    <p className="text-sm text-brand-error" role="alert">
      {message}
    </p>
  );
}

interface AddressTextFieldProps {
  form: AddressFormApi;
  name: "street" | "number" | "complement" | "neighborhood" | "city" | "country";
  label: string;
  placeholder?: string;
  /** Preenchido pelo ViaCEP: fica em leitura, sem o esmaecido do `disabled`. */
  locked?: boolean;
  className?: string;
}

/**
 * Campo de texto do endereço. Os seis são iguais — rótulo, entrada e o erro do
 * schema logo abaixo —, e só o CEP e a UF fogem do padrão.
 */
export function AddressTextField({
  form,
  name,
  label,
  placeholder,
  locked,
  className,
}: AddressTextFieldProps) {
  return (
    <form.Field name={name}>
      {(field) => (
        <div className={`flex flex-col gap-2 ${className ?? ""}`}>
          <Label htmlFor={field.name}>{label}</Label>
          <Input
            id={field.name}
            placeholder={placeholder}
            value={field.state.value}
            readOnly={locked}
            aria-readonly={locked}
            className={locked ? "bg-canvas text-steel" : undefined}
            onChange={(e) => field.handleChange(e.target.value)}
          />
          <FieldError errors={field.state.meta.errors} />
        </div>
      )}
    </form.Field>
  );
}
