"use client";

import { useCategoryProducts } from "@/hooks/use-products";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

interface CategoryProductSectionProps {
  categorySlug: string;
  title: string;
  limit?: number;
  products?: Product[];
}

export function CategoryProductSection({ categorySlug, title, limit = 4, products: externalProducts }: CategoryProductSectionProps) {
  const hasExternalData = externalProducts !== undefined;
  const { data: internalProducts, isLoading } = useCategoryProducts(categorySlug, limit, {
    enabled: !hasExternalData,
  });

  const products = externalProducts ?? internalProducts;
  const showLoading = isLoading && !hasExternalData;

  if (showLoading) {
    return (
      <section className="py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            {title}
          </h2>
          <div className="mt-10">
            <ProductGridSkeleton count={4} />
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <h2 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
          {title}
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, limit).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
