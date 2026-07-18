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
import { CreditCard } from "lucide-react";
import type { PaymentDetails } from "@/lib/checkout-context";

interface CreditCardFormProps {
  defaultValues?: PaymentDetails;
  onChange: (details: PaymentDetails) => void;
}

export function CreditCardForm({ defaultValues, onChange }: CreditCardFormProps) {
  const form = useForm({
    defaultValues: {
      cardNumber: defaultValues?.cardNumber ?? "",
      cardName: defaultValues?.cardName ?? "",
      expiry: defaultValues?.expiry ?? "",
      cvv: defaultValues?.cvv ?? "",
      installments: defaultValues?.installments ?? "1",
    },
    onSubmit: ({ value }) => {
      onChange(value);
    },
  });

  const notifyChange = () => {
    form.handleSubmit();
  };

  return (
    <div className="space-y-4" onChange={notifyChange}>
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-ink" />
        <h3 className="font-heading text-base font-semibold text-ink">
          Dados do Cartao
        </h3>
      </div>

      <form.Field name="cardNumber">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Numero do Cartao</Label>
            <Input
              id={field.name}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="cardName">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Nome no Cartao</Label>
            <Input
              id={field.name}
              placeholder="Nome impresso no cartao"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="expiry">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>Validade</Label>
              <Input
                id={field.name}
                placeholder="MM/AA"
                maxLength={5}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="cvv">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor={field.name}>CVV</Label>
              <Input
                id={field.name}
                placeholder="123"
                maxLength={4}
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="installments">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Parcelas</Label>
            <Select
              value={field.state.value}
              onValueChange={(v) => field.handleChange(v)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}x {n === 1 ? "sem juros" : "sem juros"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>
    </div>
  );
}
