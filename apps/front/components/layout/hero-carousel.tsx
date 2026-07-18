"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/hooks/use-products";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@workspace/ui/components/carousel";
import Autoplay from "embla-carousel-autoplay";

function CarouselDots() {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesCount, setSlidesCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setSlidesCount(api.scrollSnapList().length);
    setSelectedIndex(api.selectedScrollSnap());

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  if (slidesCount <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {Array.from({ length: slidesCount }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => api?.scrollTo(i)}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            i === selectedIndex
              ? "bg-on-dark w-8"
              : "bg-on-dark/40 hover:bg-on-dark/60"
          }`}
          aria-label={`Slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

function HeroSlideSkeleton() {
  return (
    <div className="relative w-full min-h-[420px] md:min-h-[480px] bg-gradient-to-br from-hero-dark-from to-hero-dark-to flex items-center">
      <div className="mx-auto max-w-[1280px] px-8 w-full">
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-10 w-3/4 bg-on-dark/10" />
          <Skeleton className="h-5 w-1/2 bg-on-dark/10" />
          <Skeleton className="h-12 w-40 rounded-full bg-on-dark/10" />
        </div>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const { data: products, isLoading, isError } = useProducts();

  const plugin = useCallback(() => Autoplay({ delay: 5000, stopOnInteraction: true }), []);

  if (isLoading) {
    return (
      <section className="relative overflow-hidden">
        <HeroSlideSkeleton />
      </section>
    );
  }

  if (isError || !products || products.length === 0) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-hero-dark-from to-hero-dark-to py-20 md:py-28 lg:py-[120px] text-on-dark">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Confira nossos<br />produtos
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-on-dark-muted">
              Explore nossa colecao de produtos com as melhores marcas e categorias para voce.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#produtos"
                className="inline-flex items-center rounded-full bg-on-dark px-5 py-2.5 text-sm font-medium text-ink hover:bg-on-dark/90 transition-colors"
              >
                Explorar Catalogo
              </a>
              <a
                href="#categorias"
                className="inline-flex items-center rounded-full border border-on-dark/30 px-5 py-2.5 text-sm font-medium text-on-dark hover:border-on-dark/60 transition-colors"
              >
                Ver Categorias
              </a>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
      </section>
    );
  }

  const featured = products.slice(0, 4);

  return (
    <section className="relative overflow-hidden">
      <Carousel
        opts={{ loop: true }}
        plugins={[plugin()]}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {featured.map((product) => {
            return (
              <CarouselItem key={product.id} className="pl-0">
                <div className="relative w-full min-h-[420px] md:min-h-[480px] bg-gradient-to-br from-hero-dark-from to-hero-dark-to flex items-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    {product.productMainImg ? (
                      <img
                        src={product.productMainImg}
                        alt=""
                        className="h-full w-full object-cover blur-sm scale-110"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-hero-dark-from/80 via-hero-dark-from/40 to-transparent" />
                  <div className="relative mx-auto max-w-[1280px] px-8 w-full">
                    <div className="flex items-center gap-8 md:gap-16">
                      <div className="hidden md:block shrink-0 w-[180px] lg:w-[220px]">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                          {product.productMainImg ? (
                            <img
                              src={product.productMainImg}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-surface text-on-dark-muted text-xs">
                              Sem imagem
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="max-w-xl py-12 md:py-0 animate-fade-in">
                        {product.category && (
                          <Badge
                            variant="outline"
                            className="mb-4 border-on-dark/30 text-on-dark-muted text-xs"
                          >
                            {product.category.title}
                          </Badge>
                        )}
                        <h2 className="font-heading text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-on-dark">
                          {product.name}
                        </h2>
                        {product.brand && (
                          <p className="mt-3 text-base text-on-dark-muted">
                            {product.brand.name}
                          </p>
                        )}
                        <div className="mt-6">
                          <Link
                            href={`/produtos/${product.id}`}
                            className="inline-flex items-center rounded-full bg-brand-green px-5 py-2.5 text-sm font-medium text-ink hover:bg-brand-green-deep transition-colors"
                          >
                            Ver produto
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </section>
  );
}
