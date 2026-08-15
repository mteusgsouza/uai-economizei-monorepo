"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { useShippingQuote } from "@/hooks/use-shipping-quote";
import { formatCep } from "@/lib/viacep";
import type { StoreSettings } from "@/lib/commerce";
import { Mono } from "@/components/ui/mono";

/** O que a consulta de frete tem a dizer, em uma linha. */
function quoteLabel(
  quote: ReturnType<typeof useShippingQuote>,
  settings: StoreSettings,
  subtotal: number,
): string | null {
  switch (quote.status) {
    case "loading":
      return "Consultando…";
    case "available": {
      const free =
        settings.freeShipping.enabled && subtotal >= settings.freeShipping.minValue;
      return free
        ? `${quote.description} · frete grátis`
        : `${quote.description} · ${formatPrice(quote.value)}`;
    }
    case "unavailable":
      return "Ainda não entregamos nesse CEP";
    case "error":
      return "Não foi possível consultar agora";
    default:
      return null;
  }
}

/**
 * Calculadora de frete do produto: o CEP consulta a tabela da loja assim que
 * os oito dígitos entram — o botão existe para quem prefere confirmar.
 */
export function ShippingEstimate({
  settings,
  subtotal,
}: {
  settings: StoreSettings;
  subtotal: number;
}) {
  const [cep, setCep] = useState("");
  const quote = useShippingQuote(cep);
  const label = quoteLabel(quote, settings, subtotal);

  const note = settings.freeShipping.enabled
    ? `Frete grátis acima de ${formatPrice(settings.freeShipping.minValue)}`
    : "Informe o CEP para ver prazo e valor";

  return (
    <div className="blueprint mt-4 p-3.5">
      <div className="flex items-center gap-2">
        <Truck className="size-[17px] flex-none text-primary" strokeWidth={1.5} />
        <Input
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="Seu CEP"
          inputMode="numeric"
          maxLength={9}
          aria-label="CEP para cálculo de frete"
          className="max-w-[140px]"
        />
        <Button variant="outline" type="button" disabled={quote.status === "loading"}>
          Calcular
        </Button>
      </div>
      <Mono as="div" className={`mt-2.5 ${label ? "text-accent-700" : "text-ink/55"}`}>
        {label ?? note}
      </Mono>
    </div>
  );
}
