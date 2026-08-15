import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import type { Promotion } from "@/types/promotion";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";
import { Tag } from "@/components/ui/tag";

/**
 * O "Preço exibido" é texto livre no admin ("a partir de R$ 549"), então o
 * prefixo antes do valor vira a legenda miúda e o valor fica no corpo grande.
 * Sem prefixo, o preço aparece sozinho — inventar "a partir de" mudaria o que
 * o admin escreveu.
 */
function splitPrice(label: string): { prefix: string | null; value: string } {
  const found = label.match(/^(.*?)(R\$\s*[\d.,]+.*)$/i);
  if (!found) return { prefix: null, value: label };

  const [, prefix = "", value = label] = found;
  return { prefix: prefix.trim() || null, value: value.trim() };
}

/**
 * Um banner de campanha: texto à esquerda — com o produto em destaque e o
 * preço logo acima dos botões — e a figura duotone à direita, limpa.
 */
export function PromoSlide({
  promo,
  priority = false,
}: {
  promo: Promotion;
  /** Só o primeiro slide entra como prioritário; os outros estão invisíveis. */
  priority?: boolean;
}) {
  const price = promo.priceLabel ? splitPrice(promo.priceLabel) : null;

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

        {(promo.productName || price) && (
          <div className="mt-7">
            {promo.productName && (
              <Mono
                as={promo.productHref ? Link : "p"}
                href={promo.productHref ?? undefined}
                className={cn(
                  "block max-w-[420px] text-lg leading-snug line-clamp-2",
                  promo.productHref && "transition-colors hover:text-accent-700",
                )}
              >
                {promo.productName}
              </Mono>
            )}

            {price && (
              <div className="mt-2 flex items-center gap-2">
                {price.prefix && <Mono className="text-ink/50">{price.prefix}</Mono>}
                <p className="font-heading text-[34px] leading-none text-accent-700 md:text-[40px]">
                  {price.value}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-2.5">
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

      <div className="blueprint duotone aspect-[4/3]">
        <ProductImage
          src={promo.image}
          alt={promo.productName ?? promo.title}
          aspectRatio="4/3"
          priority={priority}
          sizes="(max-width: 768px) 100vw, 620px"
          className="h-full"
        />
      </div>
    </div>
  );
}
