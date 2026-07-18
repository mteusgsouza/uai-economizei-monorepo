"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { Badge } from "@workspace/ui/components/badge";
import { Heart } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";

export function ProductCard({ product }: { product: Product }) {
  const { isInWishlist, toggle } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group relative">
      <Link href={`/produtos/${product.id}`} className="block">
        <div className="overflow-hidden rounded-lg border border-hairline bg-canvas transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
          <div className="relative">
            <ProductImage
              src={product.productMainImg}
              alt={product.name}
              imageClassName="transition-transform duration-300 group-hover:scale-105"
            />
            {product.category && (
              <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                {product.category.title}
              </Badge>
            )}
          </div>
          <div className="p-6">
            <h3 className="font-heading text-lg font-semibold leading-snug text-ink line-clamp-2">
              {product.name}
            </h3>
            {product.brand && (
              <p className="mt-1 text-sm text-steel line-clamp-1">
                {product.brand.name}
              </p>
            )}
            <p className="mt-2 text-base font-semibold text-ink">
              {formatPrice(product.value)}
            </p>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
        }}
        className="absolute top-5 right-5 h-8 w-8 rounded-full bg-canvas/80 backdrop-blur-sm border border-hairline flex items-center justify-center transition-all duration-200 hover:border-brand-error/40 hover:bg-canvas opacity-0 group-hover:opacity-100"
        aria-label={inWishlist ? `Remover ${product.name} da wishlist` : `Adicionar ${product.name} na wishlist`}
      >
        <Heart
          className={`h-4 w-4 transition-colors ${inWishlist ? "fill-brand-error text-brand-error" : "text-steel"}`}
        />
      </button>
    </div>
  );
}
