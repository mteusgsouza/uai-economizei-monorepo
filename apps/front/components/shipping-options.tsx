"use client";

import { Truck, Package, Store } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { ShippingOption } from "@/lib/checkout-context";

interface ShippingOptionItem {
  id: ShippingOption;
  icon: React.ReactNode;
  label: string;
  description: string;
  price: string;
  estimated: string;
}

const OPTIONS: ShippingOptionItem[] = [
  {
    id: "standard",
    icon: <Truck className="h-5 w-5" />,
    label: "Frete Standard",
    description: "Entrega via transportadora",
    price: "R$ 15,00",
    estimated: "5 a 7 dias uteis",
  },
  {
    id: "express",
    icon: <Package className="h-5 w-5" />,
    label: "Frete Expresso",
    description: "Entrega rapida prioritaria",
    price: "R$ 29,90",
    estimated: "1 a 2 dias uteis",
  },
  {
    id: "pickup",
    icon: <Store className="h-5 w-5" />,
    label: "Retirada na Loja",
    description: "Retire em nossa loja fisica",
    price: "Gratis",
    estimated: "1 dia util apos confirmacao",
  },
];

interface ShippingOptionsProps {
  selected: ShippingOption;
  onSelect: (option: ShippingOption) => void;
}

export function ShippingOptions({ selected, onSelect }: ShippingOptionsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-heading text-base font-semibold text-ink">
        Opcoes de Entrega
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
              selected === option.id
                ? "border-ink bg-ink/5 ring-1 ring-ink"
                : "border-hairline bg-surface hover:border-hairline-soft hover:bg-surface",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                selected === option.id ? "bg-ink text-on-dark" : "bg-surface text-steel",
              )}
            >
              {option.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{option.label}</p>
              <p className="text-xs text-steel">{option.description}</p>
            </div>
            <div className="mt-auto">
              <p className="text-sm font-semibold text-ink">{option.price}</p>
              <p className="text-xs text-stone">{option.estimated}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
