"use client";

import { formatPrice } from "@workspace/ui/lib/format-price";
import type { CartItem } from "@/lib/cart-context";
import { pixPrice } from "@/lib/commerce";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";
import { QuantitySelector } from "@/components/ui/quantity-selector";

interface CartDrawerItemProps {
  item: CartItem;
  pixDiscountPercent: number;
  onQuantityChange: (quantity: number) => void;
}

/** Linha do carrinho: figura marcada, taxonomia, quantidade e preço à vista. */
export function CartDrawerItem({
  item,
  pixDiscountPercent,
  onQuantityChange,
}: CartDrawerItemProps) {
  const { product, quantity } = item;
  const lineTotal = product.value * quantity;
  const showPix = product.pixDiscount && pixDiscountPercent > 0;

  return (
    <div className="flex gap-3.5 border-b border-divider py-4 last:border-b-0">
      <div className="blueprint duotone size-[84px] flex-none">
        <ProductImage
          src={product.productMainImg}
          alt={product.name}
          aspectRatio="1/1"
          sizes="84px"
        />
      </div>

      <div className="min-w-0 flex-1">
        {(product.category || product.brand) && (
          <Mono as="div" className="truncate text-ink/50">
            {[product.category?.title, product.brand?.name].filter(Boolean).join(" · ")}
          </Mono>
        )}
        <div className="mt-0.5 mb-1.5 font-heading text-[17px] leading-tight">
          {product.name}
        </div>

        <div className="flex items-center gap-2.5">
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
            min={0}
            max={product.stock || Infinity}
          />
          <div className="ml-auto text-right">
            <div className="font-heading text-lg leading-tight">{formatPrice(lineTotal)}</div>
            {showPix && (
              <Mono as="div" className="text-accent-700">
                {formatPrice(pixPrice(lineTotal, pixDiscountPercent))} PIX
              </Mono>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
