"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { cn } from "@workspace/ui/lib/utils";
import type { Product } from "@/types/product";
import { pixPrice } from "@/lib/commerce";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";

interface WishlistCardProps {
  product: Product;
  pixDiscountPercent: number;
  onRemove: (productId: number) => void;
}

/**
 * O produto salvo. É o cartão da vitrine sem a taxonomia e com o coração
 * preenchido — clicar nele tira o item da lista. O aviso de queda de preço do
 * mockup não entra: não há histórico de preço no modelo.
 */
export function WishlistCard({ product, pixDiscountPercent, onRemove }: WishlistCardProps) {
  const outOfStock = product.stock <= 0;
  const showPix = product.pixDiscount && pixDiscountPercent > 0 && !outOfStock;

  return (
    <div className="pcard blueprint relative flex flex-col p-4">
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="absolute right-2 top-2 z-10 p-1.5 text-primary transition-colors hover:text-accent-800"
        aria-label={`Remover ${product.name} dos favoritos`}
      >
        <Heart className="size-[17px]" fill="currentColor" />
      </button>

      <Link href={`/produtos/${product.id}`} className="block text-inherit">
        <div className={cn("duotone", outOfStock && "opacity-55")}>
          <ProductImage
            src={product.productMainImg}
            alt={product.name}
            aspectRatio="1/1"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        </div>
        <div className="mt-3 line-clamp-2 font-heading text-lg leading-tight">
          {product.name}
        </div>
      </Link>

      <Mono as="div" className="mt-1.5 text-ink/50">
        {outOfStock ? "sem estoque no momento" : "salvo nos favoritos"}
      </Mono>

      <div className="mt-2 flex-1">
        {product.listPrice !== null && !outOfStock && (
          <div className="text-xs text-ink/45 line-through">
            {formatPrice(product.listPrice)}
          </div>
        )}
        <div
          className={cn(
            "font-heading text-[26px] leading-none",
            outOfStock && "text-ink/55",
          )}
        >
          {formatPrice(product.value)}
        </div>
        {showPix ? (
          <Mono as="div" className="mt-1 text-accent-700">
            {formatPrice(pixPrice(product.value, pixDiscountPercent))} no PIX
          </Mono>
        ) : (
          outOfStock && (
            <Mono as="div" className="mt-1 text-ink/50">
              último preço visto
            </Mono>
          )
        )}
      </div>

      <AddToCartButton
        product={product}
        label="Adicionar à sacola"
        className="mt-3 w-full"
      />
    </div>
  );
}
