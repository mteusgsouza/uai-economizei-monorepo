"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import type { CartItem } from "@/lib/cart-context";
import { useCart } from "@/lib/cart-context";

function formatPrice(price: string) {
  const num = parseFloat(price);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const price = parseFloat(product.price) * quantity;

  return (
    <div className="flex gap-4 py-6 first:pt-0">
      <Link
        href={`/produtos/${product.id}`}
        className="block w-20 flex-shrink-0 overflow-hidden rounded-lg border border-hairline bg-surface md:w-24"
      >
        <div className="aspect-[3/4] relative">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-stone text-xs">
              Sem capa
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/produtos/${product.id}`}
            className="font-heading text-sm font-medium text-ink hover:text-brand-green transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          {product.authors.length > 0 && (
            <p className="mt-0.5 text-xs text-steel line-clamp-1">
              {product.authors.join(", ")}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-ink">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 rounded-lg border border-hairline bg-canvas p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => updateQuantity(product.id, quantity - 1)}
              aria-label="Diminuir quantidade"
              className="rounded-full text-ink hover:bg-surface"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums text-ink">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              aria-label="Aumentar quantidade"
              className="rounded-full text-ink hover:bg-surface"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

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
          {formatPrice(price.toFixed(2))}
        </p>
      </div>
    </div>
  );
}
