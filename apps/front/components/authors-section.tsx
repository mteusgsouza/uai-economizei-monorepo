"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductCardCompact } from "./product-card-compact";
import { HorizontalScroll } from "./horizontal-scroll";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { User } from "lucide-react";
import Link from "next/link";

export function AuthorsSection() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-canvas">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Autores
            </h2>
          </div>
          <div className="space-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="shrink-0 w-[150px] aspect-[3/4] rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  const authorCounts = new Map<string, number>();
  products.forEach((p) => {
    p.authors.forEach((author) => {
      authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
    });
  });

  const topAuthors = Array.from(authorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (topAuthors.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-canvas">
      <div className="mx-auto max-w-[1280px] px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Autores
            </h2>
            <p className="mt-2 text-steel">
              Conheca os principais autores da nossa colecao.
            </p>
          </div>
          <Link
            href="/autores"
            className="text-sm font-medium text-steel hover:text-ink transition-colors shrink-0"
          >
            Ver todos
          </Link>
        </div>

        <div className="space-y-12">
          {topAuthors.map(([author, count]) => {
            const authorProducts = products
              .filter((p) => p.authors.includes(author))
              .slice(0, 8);

            return (
              <div key={author}>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-steel" />
                  <span className="font-heading text-lg font-semibold text-ink">
                    {author}
                  </span>
                  <span className="text-sm text-steel">
                    · {count} {count === 1 ? "titulo" : "titulos"}
                  </span>
                </div>
                <HorizontalScroll>
                  {authorProducts.map((product) => (
                    <ProductCardCompact key={product.id} product={product} />
                  ))}
                </HorizontalScroll>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
