import { formatPrice } from "@workspace/ui/lib/format-price"
import { cn } from "@workspace/ui/lib/utils"
import type { Product } from "@/types/product"
import { installment, pixPrice } from "@/lib/commerce"
import { Mono } from "@/components/ui/mono"

const VALUE_SIZE = {
  sm: "text-[21px]",
  md: "text-[26px]",
  lg: "text-[34px]",
} as const

interface ProductPriceProps {
  product: Pick<Product, "value" | "listPrice" | "pixDiscount">
  pixDiscountPercent: number
  maxInstallments: number
  /** `sm` é o cartão compacto do mobile, que também esconde a parcela. */
  size?: keyof typeof VALUE_SIZE
  className?: string
}

/**
 * O preço como ficha técnica: cheio riscado, preço, à vista no PIX e parcela.
 * Mesmo bloco no cartão, no destaque e onde mais o produto for vendido.
 */
export function ProductPrice({
  product,
  pixDiscountPercent,
  maxInstallments,
  size = "md",
  className,
}: ProductPriceProps) {
  const showPix = product.pixDiscount && pixDiscountPercent > 0

  return (
    <div className={className}>
      {product.listPrice !== null && (
        <div className={cn("text-ink/45 line-through", size === "sm" ? "text-[11px]" : "text-xs")}>
          {formatPrice(product.listPrice)}
        </div>
      )}
      <div className={cn("font-heading leading-tight", VALUE_SIZE[size])}>
        {formatPrice(product.value)}
      </div>
      {showPix && (
        <Mono as="div" className="mt-0.5 text-accent-700">
          {formatPrice(pixPrice(product.value, pixDiscountPercent))} no PIX
        </Mono>
      )}
      {size !== "sm" && (
        <Mono as="div" className="mt-0.5 text-ink/50">
          ou {maxInstallments}x {formatPrice(installment(product.value, maxInstallments))}
        </Mono>
      )}
    </div>
  )
}
