"use client";

import { ProductCard } from "@/components/product/product-card";
import { useStoreSettings } from "@/lib/store-settings-context";
import type { Product } from "@/types/product";

/** Os produtos que o assistente achou — vêm da busca do servidor, nunca do texto do modelo. */
export function SearchAssistantResults({ products }: { products: Product[] }) {
  const settings = useStoreSettings();
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          imageAspect="4/3"
          pixDiscountPercent={settings.pixDiscountPercent}
          maxInstallments={settings.maxInstallments}
        />
      ))}
    </div>
  );
}
