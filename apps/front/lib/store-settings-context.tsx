"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoreSettings } from "@/lib/commerce";

/** Loja sem configuração — mesmo fallback de `lib/catalog/settings.ts`. */
const FALLBACK: StoreSettings = {
  freeShipping: { enabled: false, minValue: 0, area: null },
  pixDiscountPercent: 0,
  maxInstallments: 12,
  cardFees: { hidden: false, cashLabel: null, rates: [] },
  campaign: { name: null },
  homeStats: { hidden: false, items: [] },
  benefits: { hidden: false, items: [] },
  theme: { primaryColor: null, radius: null },
};

const StoreSettingsContext = createContext<StoreSettings>(FALLBACK);

/**
 * As regras comerciais disponíveis para toda a árvore do storefront. O layout
 * (server) lê o global uma vez e entrega aqui; carrinho, checkout e resumo são
 * client components e precisariam receber isso por props de outro jeito.
 */
export function StoreSettingsProvider({
  value,
  children,
}: {
  value: StoreSettings;
  children: ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): StoreSettings {
  return useContext(StoreSettingsContext);
}
