"use client";

import { Truck, Store, MapPinOff, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { formatPrice } from "@workspace/ui/lib/format-price";
import type { ShippingOption } from "@/lib/checkout-context";
import type { ShippingQuote } from "@/lib/shipping";

interface ShippingOptionsProps {
  selected: ShippingOption;
  onSelect: (option: ShippingOption) => void;
  /** Resultado da consulta à tabela de fretes pelo CEP informado. */
  quote: ShippingQuote;
}

function DeliveryDetail({ quote }: { quote: ShippingQuote }) {
  switch (quote.status) {
    case "idle":
      return <span className="text-sm text-steel">Informe o CEP para calcular</span>;
    case "loading":
      return (
        <span className="flex items-center gap-1.5 text-sm text-steel">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Calculando...
        </span>
      );
    case "available":
      return <span className="text-sm font-semibold text-ink">{formatPrice(quote.value)}</span>;
    case "unavailable":
      return <span className="text-sm text-brand-error">Fora da area</span>;
    default:
      return <span className="text-sm text-brand-error">Erro ao calcular</span>;
  }
}

export function ShippingOptions({ selected, onSelect, quote }: ShippingOptionsProps) {
  const deliveryBlocked = quote.status !== "available";

  return (
    <div>
      <h3 className="font-heading text-lg font-semibold text-ink">Entrega</h3>

      {quote.status === "unavailable" && (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-surface p-3 text-sm text-steel">
          <MapPinOff className="mt-0.5 h-4 w-4 shrink-0 text-brand-error" />
          Ainda nao entregamos nesse CEP. Voce pode retirar no balcao ou usar um endereco
          dentro da nossa area de entrega.
        </p>
      )}

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => onSelect("delivery")}
          disabled={deliveryBlocked}
          className={cn(
            "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors",
            selected === "delivery" && !deliveryBlocked
              ? "border-ink bg-surface"
              : "border-hairline hover:border-steel",
            deliveryBlocked && "cursor-not-allowed opacity-60",
          )}
        >
          <Truck className="h-5 w-5 shrink-0 text-steel" />
          <div className="flex-1">
            <p className="font-medium text-ink">Entrega no endereco</p>
            <p className="text-sm text-steel">
              {quote.status === "available" ? quote.description : "Calculado pelo seu CEP"}
            </p>
          </div>
          <DeliveryDetail quote={quote} />
        </button>

        <button
          type="button"
          onClick={() => onSelect("pickup")}
          className={cn(
            "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors",
            selected === "pickup" ? "border-ink bg-surface" : "border-hairline hover:border-steel",
          )}
        >
          <Store className="h-5 w-5 shrink-0 text-steel" />
          <div className="flex-1">
            <p className="font-medium text-ink">Retirada no balcao</p>
            <p className="text-sm text-steel">Retire em nossa loja fisica</p>
          </div>
          <span className="text-sm font-semibold text-ink">Gratis</span>
        </button>
      </div>
    </div>
  );
}
