"use client";

import { useProducts } from "@/hooks/use-products";
import { GENRE_LABELS } from "@/types/product";
import { CategoryCard } from "./product-card-compact";
import { HorizontalScroll } from "./horizontal-scroll";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CategoriesSection() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-surface">
        <div className="mx-auto max-w-[1280px] px-8">
          <HorizontalScroll title="Categorias" href="/categorias">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="shrink-0 w-[200px] aspect-[2/3] rounded-xl" />
            ))}
          </HorizontalScroll>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  const genreEntries = Object.entries(GENRE_LABELS);

  const latestPerGenre = genreEntries
    .map(([genre, label]) => {
      const latest = products.find((p) => p.genre === genre);
      return latest ? { genre, label, product: latest } : null;
    })
    .filter((entry): entry is { genre: string; label: string; product: typeof products[number] } => entry !== null);

  if (latestPerGenre.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-surface">
      <div className="mx-auto max-w-[1280px] px-8">
        <HorizontalScroll title="Categorias" href="/categorias">
          {latestPerGenre.map(({ genre, label, product }) => (
            <CategoryCard key={genre} genre={genre} label={label} product={product} />
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
}
