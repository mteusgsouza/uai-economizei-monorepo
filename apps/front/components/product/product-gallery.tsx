"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import type { Product } from "@/types/product";
import { discountLabel } from "@/lib/commerce";
import { ProductImage } from "@/components/ui/product-image";
import { Tag } from "@/components/ui/tag";

/**
 * A prancha do produto: coluna de miniaturas à esquerda e a figura grande em
 * duotone. Só a miniatura escolhida fica em duotone — as outras ficam apagadas
 * até serem chamadas.
 */
export function ProductGallery({ product }: { product: Product }) {
  const images = [
    product.productMainImg,
    ...product.productImages.map((img) => img.url),
  ].filter(Boolean);

  const [current, setCurrent] = useState(0);
  const badge = discountLabel(product.discountPercent);
  const active = images[current] ?? product.productMainImg;

  return (
    <div className="flex gap-3 md:gap-4">
      {images.length > 1 && (
        <div className="flex w-16 flex-none flex-col gap-2.5 md:w-[88px]">
          {images.slice(0, 6).map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn(
                "blueprint block w-full transition-colors",
                i === current ? "border-primary" : "hover:border-primary",
              )}
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-current={i === current}
            >
              <div className={i === current ? "duotone" : undefined}>
                <ProductImage
                  src={src}
                  alt=""
                  aspectRatio="1/1"
                  sizes="88px"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="blueprint duotone relative min-w-0 flex-1">
        <ProductImage
          src={active}
          alt={product.name}
          aspectRatio="1/1"
          priority
          sizes="(max-width: 768px) 100vw, 620px"
        />
        {badge && <Tag className="absolute left-3 top-3">{badge}</Tag>}
      </div>
    </div>
  );
}
