"use client";

import { useEffect, useMemo } from "react";
import { hasConsent } from "@/components/layout/cookie-consent";
import { ProductCard } from "@/components/product/product-card";
import { ProductShelf } from "@/components/product/product-shelf";
import { useProductsByIds } from "@/hooks/use-products";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { clearRecentlyViewed, recordView } from "@/lib/recently-viewed";
import { useStoreSettings } from "@/lib/store-settings-context";
import type { Product } from "@/types/product";

const VISIBLE = 4;

/**
 * "Vistos recentemente": registra a visita ao produto aberto e mostra os que a
 * pessoa viu antes dele. Só existe no client — no servidor não há histórico,
 * então a seção nasce vazia e aparece depois de hidratar.
 */
export function RecentlyViewed({ productId }: { productId: number }) {
  const settings = useStoreSettings();
  const viewed = useRecentlyViewed();

  // Histórico é conveniência, não cookie essencial: só grava com "Aceitar
  // todos". Sem consentimento, qualquer sobra é apagada — a faixa some junto.
  useEffect(() => {
    if (hasConsent("all")) recordView(productId);
    else clearRecentlyViewed();
  }, [productId]);

  // O produto aberto acabou de entrar na frente da fila; na própria página ele
  // não aparece.
  const ids = useMemo(() => viewed.filter((id) => id !== productId), [viewed, productId]);

  const { data: catalog } = useProductsByIds(ids, { enabled: ids.length > 0 });

  // `useProductsByIds` não filtra `active` (o histórico de pedidos precisa do
  // produto fora do ar); aqui ele sai. A ordem é a da visita, não a do catálogo.
  const products = ids
    .map((id) => catalog?.get(id))
    .filter((product): product is Product => product?.active === true)
    .slice(0, VISIBLE);

  if (products.length === 0) return null;

  return (
    <ProductShelf
      title="Vistos recentemente"
      action={
        <button
          type="button"
          onClick={clearRecentlyViewed}
          className="text-sm text-ink/55 hover:text-primary hover:underline"
        >
          Limpar histórico
        </button>
      }
    >
      {products.map((item) => (
        <ProductCard
          key={item.id}
          product={item}
          pixDiscountPercent={settings.pixDiscountPercent}
          maxInstallments={settings.maxInstallments}
        />
      ))}
    </ProductShelf>
  );
}
