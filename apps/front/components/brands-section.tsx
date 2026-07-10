"use client";

import { useBrands, useProducts } from "@/hooks/use-products";
import { ProductCardCompact } from "./product-card-compact";
import { HorizontalScroll } from "./horizontal-scroll";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Building2 } from "lucide-react";
import Link from "next/link";

export function BrandsSection() {
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: products, isLoading: productsLoading } = useProducts();

  const isLoading = brandsLoading || productsLoading;

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-canvas">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Marcas
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

  if (!brands || brands.length === 0 || !products || products.length === 0) return null;

  const brandsWithCounts = brands
    .map((brand) => {
      const brandProducts = products.filter((p) => p.brand?.id === brand.id);
      return { brand, products: brandProducts, count: brandProducts.length };
    })
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  if (brandsWithCounts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-canvas">
      <div className="mx-auto max-w-[1280px] px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Marcas
            </h2>
            <p className="mt-2 text-steel">
              Conheca as principais marcas da nossa colecao.
            </p>
          </div>
          <Link
            href="/marcas"
            className="text-sm font-medium text-steel hover:text-ink transition-colors shrink-0"
          >
            Ver todos
          </Link>
        </div>

        <div className="space-y-12">
          {brandsWithCounts.map(({ brand, products: brandProducts, count }) => {
            return (
              <div key={brand.id}>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-4 w-4 text-steel" />
                  <span className="font-heading text-lg font-semibold text-ink">
                    {brand.name}
                  </span>
                  <span className="text-sm text-steel">
                    · {count} {count === 1 ? "produto" : "produtos"}
                  </span>
                </div>
                <HorizontalScroll>
                  {brandProducts.slice(0, 8).map((product) => (
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
