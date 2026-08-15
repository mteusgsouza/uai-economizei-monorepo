"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import type { PromotionShowcase } from "@/types/promotion";
import { Mono } from "@/components/ui/mono";
import { PromoSlide } from "./promo-slide";

const AUTOPLAY_MS = 6000;

/**
 * A vitrine de campanha: um slide por promoção no ar, com o período assinando
 * o topo. A troca é por fundido — os slides ficam empilhados na mesma célula
 * da grade, então a altura acompanha o maior e nada salta ao trocar.
 *
 * Sem promoção ativa a seção inteira some: melhor não ter vitrine do que ter
 * uma vazia.
 */
export function PromoCarousel({ showcase }: { showcase: PromotionShowcase }) {
  const { promotions, campaignName, campaignPeriod } = showcase;
  const total = promotions.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (i: number) => setCurrent(((i % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [total, paused]);

  if (total === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      className="mx-auto max-w-[1280px] px-4 pt-8 md:px-10 md:pt-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Campanhas em destaque"
    >
      {(campaignName || campaignPeriod) && (
        <div className="mb-5 flex items-center gap-3">
          {campaignName && <Mono className="text-accent-700">{campaignName}</Mono>}
          <span className="h-px flex-1 bg-divider" />
          {campaignPeriod && <Mono className="text-ink/45">{campaignPeriod}</Mono>}
        </div>
      )}

      <div className="grid">
        {promotions.map((promo, i) => {
          const active = i === current;
          return (
            <div
              key={promo.id}
              // Todos ocupam a mesma célula: a altura é a do maior slide e o
              // fundido acontece sem deslocar nada abaixo.
              className="col-start-1 row-start-1 transition-opacity duration-500 motion-reduce:transition-none"
              style={{
                opacity: active ? 1 : 0,
                pointerEvents: active ? "auto" : "none",
                visibility: active ? "visible" : "hidden",
              }}
              aria-hidden={!active}
            >
              <PromoSlide promo={promo} priority={i === 0} />
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <div className="mt-5 flex items-center gap-3.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => go(current - 1)}
            aria-label="Banner anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => go(current + 1)}
            aria-label="Próximo banner"
          >
            <ChevronRight className="size-4" />
          </Button>
          <div className="flex items-center gap-[7px]">
            {promotions.map((promo, i) => (
              <button
                key={promo.id}
                type="button"
                className="dot-nav"
                data-on={i === current ? "1" : "0"}
                onClick={() => go(i)}
                aria-label={`Banner ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>
          <span className="h-px flex-1 bg-divider" />
          <Mono className="text-ink/50">
            {pad(current + 1)} / {pad(total)}
          </Mono>
        </div>
      )}
    </section>
  );
}
