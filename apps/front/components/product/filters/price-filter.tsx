"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import usePageParams from "@/hooks/usePageParams";

/** Faixa de preço com inputs livres; grava precoMin/precoMax na query no blur. */
export function PriceFilter() {
  const { searchParams, router, pathname } = usePageParams();
  const [minInput, setMinInput] = useState(searchParams.get("precoMin") ?? "");
  const [maxInput, setMaxInput] = useState(searchParams.get("precoMax") ?? "");

  function commit(param: "precoMin" | "precoMax", raw: string) {
    const val = raw ? Number(raw.replace(/\D/g, "")) : undefined;
    const params = new URLSearchParams(searchParams.toString());
    if (val !== undefined && !Number.isNaN(val)) {
      params.set(param, String(val));
    } else {
      params.delete(param);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink">Preco</h3>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="preco-min" className="text-xs text-steel">
            Min
          </Label>
          <Input
            id="preco-min"
            type="text"
            inputMode="numeric"
            placeholder="R$ 0"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={() => commit("precoMin", minInput)}
            className="mt-1"
          />
        </div>
        <span className="mt-5 text-steel">-</span>
        <div className="flex-1">
          <Label htmlFor="preco-max" className="text-xs text-steel">
            Max
          </Label>
          <Input
            id="preco-max"
            type="text"
            inputMode="numeric"
            placeholder="R$ 999"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={() => commit("precoMax", maxInput)}
            className="mt-1"
          />
        </div>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
