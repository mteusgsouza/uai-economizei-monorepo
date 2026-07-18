"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

interface CategoryProductSectionProps {
  categorySlug: string;
  title: string;
  limit?: number;
}

export function CategoryProductSection({ categorySlug, title, limit = 4 }: CategoryProductSectionProps) {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
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

  if (!products) return null;

  const filtered = products.filter((p) => p.category?.categorySlug === categorySlug);

  if (filtered.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <h2 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
          {title}
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.slice(0, limit).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
