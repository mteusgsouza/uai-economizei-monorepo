"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@workspace/ui/lib/format-price";
import type { CartItem } from "@/lib/cart-context";
import { useCart } from "@/lib/cart-context";
import { pixPrice } from "@/lib/commerce";
import { useStoreSettings } from "@/lib/store-settings-context";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";
import { QuantitySelector } from "@/components/ui/quantity-selector";

/** Linha do carrinho em página: figura marcada, taxonomia, quantidade e preço. */
export function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const settings = useStoreSettings();
  const { product, quantity } = item;

  const lineTotal = product.value * quantity;
  const showPix = product.pixDiscount && settings.pixDiscountPercent > 0;
  const taxonomy = [product.category?.title, product.brand?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex gap-4 border-b border-divider py-4 last:border-b-0">
      <Link href={`/produtos/${product.id}`} className="blueprint duotone size-20 flex-none">
        <ProductImage
          src={product.productMainImg}
          alt={product.name}
          aspectRatio="1/1"
          sizes="80px"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {taxonomy && (
          <Mono as="div" className="truncate text-ink/50">
            {taxonomy}
          </Mono>
        )}
        <Link
          href={`/produtos/${product.id}`}
          className="mt-0.5 line-clamp-2 font-heading text-[17px] leading-tight text-inherit hover:text-accent-700"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2.5">
          <QuantitySelector
            value={quantity}
            onChange={(v) => updateQuantity(product.id, v)}
            max={product.stock || Infinity}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(product.id)}
            aria-label={`Remover ${product.name}`}
          >
            <Trash2 className="size-4" />
            <span className="hidden sm:inline">Remover</span>
          </Button>

          <div className="ml-auto text-right">
            <div className="font-heading text-lg leading-tight">
              {formatPrice(lineTotal)}
            </div>
            {showPix && (
              <Mono as="div" className="text-accent-700">
                {formatPrice(pixPrice(lineTotal, settings.pixDiscountPercent))} PIX
              </Mono>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
