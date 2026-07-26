"use client";

import { useCategories, useProducts } from "@/hooks/use-products";
import type { HomeCategory } from "@/hooks/use-products";
import type { Product } from "@/types/product";
import { CategoryCard } from "@/components/category/category-card";
import { HorizontalScroll } from "@/components/layout/horizontal-scroll";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CategoriesSection({ categories: externalCategories }: { categories?: HomeCategory[] }) {
  const hasExternalData = externalCategories !== undefined;

  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: prodLoading } = useProducts(50, { enabled: !hasExternalData });

  const isLoading = hasExternalData ? false : catLoading || prodLoading;

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

  // Quando recebe dados externos (home page), as categorias já têm productImage
  if (hasExternalData && externalCategories) {
    if (externalCategories.length === 0) return null;

    const categoriesWithImages = externalCategories.map((cat) => ({
      category: {
        id: cat.id,
        title: cat.title,
        categorySlug: cat.categorySlug,
        image: cat.productImage,
        subcategories: cat.subcategories,
      },
      product: null as Product | null,
    }));

    return (
      <section className="py-16 md:py-20 lg:py-24 bg-surface">
        <div className="mx-auto max-w-[1280px] px-8">
          <HorizontalScroll title="Categorias" href="/categorias">
            {categoriesWithImages.map(({ category, product }) => (
              <CategoryCard key={category.id} category={category} imageProduct={product} className="shrink-0 w-[200px] snap-start" />
            ))}
          </HorizontalScroll>
        </div>
      </section>
    );
  }

  // Modo standalone: busca interna com useCategories + useProducts
  if (!categories || categories.length === 0) return null;

  const categoriesWithImages = categories.map((category) => {
    const representativeProduct = products?.find((p) => p.category?.id === category.id) ?? null;
    return { category, product: representativeProduct };
  });

  if (categoriesWithImages.length === 0) return null;

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-surface">
      <div className="mx-auto max-w-[1280px] px-8">
        <HorizontalScroll title="Categorias" href="/categorias">
          {categoriesWithImages.map(({ category, product }) => (
            <CategoryCard key={category.id} category={category} imageProduct={product} className="shrink-0 w-[200px] snap-start" />
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
}
