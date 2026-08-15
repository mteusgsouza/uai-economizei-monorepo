"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { formatPrice } from "@workspace/ui/lib/format-price"
import { cn } from "@workspace/ui/lib/utils"
import type { Product } from "@/types/product"
import { useWishlist } from "@/hooks/use-wishlist"
import { discountLabel, installment, pixPrice } from "@/lib/commerce"
import { AddToCartButton } from "@/components/ui/add-to-cart-button"
import { Mono } from "@/components/ui/mono"
import { ProductImage } from "@/components/ui/product-image"
import { Tag } from "@/components/ui/tag"

interface ProductCardProps {
  product: Product
  pixDiscountPercent?: number
  maxInstallments?: number
  /** Variante compacta do mobile: menos linhas, tipos menores. */
  compact?: boolean
  /** A listagem usa figura 4/3; a vitrine, quadrada. */
  imageAspect?: "1/1" | "4/3"
  className?: string
}

/**
 * O cartão de produto do sistema: figura duotone quadrada, taxonomia em mono e
 * o preço como ficha técnica — cheio riscado, preço, à vista no PIX e parcela.
 * Nada de adesivo colorido; o desconto é um dado como os outros.
 */
export function ProductCard({
  product,
  pixDiscountPercent = 0,
  maxInstallments = 12,
  compact = false,
  imageAspect = "1/1",
  className,
}: ProductCardProps) {
  const { isInWishlist, toggle } = useWishlist()

  const inWishlist = isInWishlist(product.id)
  const badge = discountLabel(product.discountPercent)
  const showPix = product.pixDiscount && pixDiscountPercent > 0
  const taxonomy = [product.category?.title, product.subcategoryTitle ?? product.subcategory, product.brand?.name]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className={cn("pcard blueprint flex flex-col", compact ? "p-3" : "p-4", className)}>
      <Link href={`/produtos/${product.id}`} className="group block text-inherit">
        <div className="relative">
          <div className="duotone">
            <ProductImage
              src={product.productMainImg}
              alt={product.name}
              aspectRatio={imageAspect}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
          {badge && <Tag className={cn("absolute", compact ? "top-1.5 left-1.5" : "top-2 left-2")}>{badge}</Tag>}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggle(product.id)
            }}
            className={cn(
              "absolute top-0 right-0 p-2 text-ink/40 transition-colors hover:text-primary",
              inWishlist && "text-primary"
            )}
            aria-label={inWishlist ? `Remover ${product.name} dos favoritos` : `Salvar ${product.name} nos favoritos`}
          >
            <Heart className="size-4" fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>

        {taxonomy && !compact && (
          <Mono as="div" className="mt-3.5 line-clamp-1 text-ink/50">
            {taxonomy}
          </Mono>
        )}
        <div
          className={cn(
            "font-heading leading-tight",
            compact ? "mt-2.5 line-clamp-2 text-base" : "mt-1 line-clamp-2 text-[19px]"
          )}
        >
          {product.name}
        </div>
      </Link>

      <div className={cn("mt-2.5 flex-1", !compact && "border-t border-divider pt-2.5")}>
        {product.listPrice !== null && (
          <div className={cn("text-ink/45 line-through", compact ? "text-[11px]" : "text-xs")}>
            {formatPrice(product.listPrice)}
          </div>
        )}
        <div className={cn("font-heading leading-tight", compact ? "text-[21px]" : "text-[26px]")}>
          {formatPrice(product.value)}
        </div>
        {showPix && (
          <Mono as="div" className="mt-0.5 text-accent-700">
            {formatPrice(pixPrice(product.value, pixDiscountPercent))} no PIX
          </Mono>
        )}
        {!compact && (
          <Mono as="div" className="mt-0.5 text-ink/50">
            ou {maxInstallments}x {formatPrice(installment(product.value, maxInstallments))}
          </Mono>
        )}
      </div>

      <AddToCartButton product={product} className="mt-3 w-full" />
    </div>
  )
}
