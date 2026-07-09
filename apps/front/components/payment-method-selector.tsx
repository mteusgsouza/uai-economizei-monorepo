"use client";

import { CreditCard, QrCode, Barcode } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { PaymentMethod } from "@/lib/checkout-context";

interface PaymentOption {
  id: PaymentMethod;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const OPTIONS: PaymentOption[] = [
  {
    id: "CREDIT_CARD",
    icon: <CreditCard className="h-5 w-5" />,
    label: "Cartao de Credito",
    description: "Ate 12x sem juros",
  },
  {
    id: "PIX",
    icon: <QrCode className="h-5 w-5" />,
    label: "PIX",
    description: "Aprovacao instantanea",
  },
  {
    id: "BOLETO",
    icon: <Barcode className="h-5 w-5" />,
    label: "Boleto",
    description: "Vencimento em 3 dias uteis",
  },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all",
            selected === option.id
              ? "border-ink bg-ink/5 ring-1 ring-ink"
              : "border-hairline bg-surface hover:border-hairline-soft",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              selected === option.id ? "bg-ink text-on-dark" : "bg-surface text-steel",
            )}
          >
            {option.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{option.label}</p>
            <p className="text-xs text-steel">{option.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
