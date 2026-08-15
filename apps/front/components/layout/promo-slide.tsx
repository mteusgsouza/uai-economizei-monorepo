import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import type { Promotion } from "@/types/promotion";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";
import { Tag } from "@/components/ui/tag";

/**
 * Um banner de campanha: texto à esquerda, figura duotone à direita com a
 * etiqueta do produto colada no canto inferior, como uma legenda de prancha.
 */
export function PromoSlide({
  promo,
  priority = false,
}: {
  promo: Promotion;
  /** Só o primeiro slide entra como prioritário; os outros estão invisíveis. */
  priority?: boolean;
}) {
  const caption = [promo.productName, promo.priceLabel].filter(Boolean).join(" · ");

  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <div>
        {(promo.discountLabel || promo.note) && (
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            {promo.discountLabel && (
              <Tag className="px-3 py-[5px] text-[13px]">{promo.discountLabel}</Tag>
            )}
            {promo.note && <Mono className="text-ink/50">{promo.note}</Mono>}
          </div>
        )}

        <h2 className="max-w-[560px] font-heading text-[40px] uppercase leading-[0.96] tracking-[-0.02em] md:text-[68px] md:leading-[0.94]">
          {promo.title}
        </h2>

        {promo.description && (
          <p className="mt-4 max-w-[440px] text-sm text-ink/70 md:text-base">
            {promo.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2.5">
          {promo.ctaLabel && (
            <Button asChild size="lg">
              <Link href={promo.ctaUrl || "/produtos"}>{promo.ctaLabel}</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link href="/produtos">Explorar catálogo</Link>
          </Button>
        </div>
      </div>

      <div className="blueprint duotone relative aspect-[4/3]">
        <ProductImage
          src={promo.image}
          alt={promo.productName ?? promo.title}
          aspectRatio="4/3"
          priority={priority}
          sizes="(max-width: 768px) 100vw, 620px"
          className="h-full"
        />
        {caption && (
          <div className="absolute bottom-0 left-0 border-r border-t border-divider bg-canvas px-4 py-2.5">
            <Mono>{caption}</Mono>
          </div>
        )}
      </div>
    </div>
  );
}
