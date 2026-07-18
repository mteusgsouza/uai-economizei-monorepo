"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import type { CartItem } from "@/lib/cart-context";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { ProductImage } from "@/components/ui/product-image";
import { QuantitySelector } from "@/components/ui/quantity-selector";

export function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const price = product.value * quantity;

  return (
    <div className="flex gap-4 py-6 first:pt-0">
      <Link
        href={`/produtos/${product.id}`}
        className="block w-20 flex-shrink-0 overflow-hidden rounded-lg border border-hairline bg-surface md:w-24"
      >
        <ProductImage
          src={product.productMainImg}
          alt={product.name}
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/produtos/${product.id}`}
            className="font-heading text-sm font-medium text-ink hover:text-brand-green transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          {product.brand && (
            <p className="mt-0.5 text-xs text-steel line-clamp-1">
              {product.brand.name}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-ink">
            {formatPrice(product.value)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <QuantitySelector
            value={quantity}
            onChange={(v) => updateQuantity(product.id, v)}
            size="sm"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(product.id)}
            className="text-ink hover:text-brand-error"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Remover</span>
          </Button>
        </div>
      </div>

      <div className="hidden flex-shrink-0 text-right sm:block">
        <p className="text-sm font-semibold text-ink">
          {formatPrice(price)}
        </p>
      </div>
    </div>
  );
}
