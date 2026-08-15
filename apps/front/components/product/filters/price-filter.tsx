"use client";

import { useEffect, useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Mono } from "@/components/ui/mono";
import { useFilterParams } from "./use-filter-params";

/** Centavos → "R$ 1.234" para o campo; vazio quando não há filtro. */
function toField(cents: string | undefined): string {
  if (!cents) return "";
  const value = Number(cents);
  if (!Number.isFinite(value)) return "";
  return `R$ ${Math.round(value / 100).toLocaleString("pt-BR")}`;
}

/** "R$ 1.234" → centavos. Só os dígitos importam. */
function toCents(field: string): string | null {
  const digits = field.replace(/\D/g, "");
  if (!digits) return null;
  return String(Number(digits) * 100);
}

/**
 * Faixa de preço em dois campos. O commit acontece no blur ou no Enter — a
 * cada tecla seria uma navegação nova.
 */
export function PriceFilter() {
  const { get, setMany } = useFilterParams();
  const min = get("precoMin");
  const max = get("precoMax");

  const [from, setFrom] = useState(() => toField(min));
  const [to, setTo] = useState(() => toField(max));

  // Ressincroniza quando os chips ou "Limpar" mexem na URL por fora.
  useEffect(() => setFrom(toField(min)), [min]);
  useEffect(() => setTo(toField(max)), [max]);

  function commit() {
    setMany({ precoMin: toCents(from), precoMax: toCents(to) });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        placeholder="R$ 0"
        aria-label="Preço mínimo"
        inputMode="numeric"
      />
      <Mono className="flex-none text-ink/50">até</Mono>
      <Input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        placeholder="R$ 3.000"
        aria-label="Preço máximo"
        inputMode="numeric"
      />
    </div>
  );
}
