"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useCategories, useProducts } from "@/hooks/use-products";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { FolderOpen } from "lucide-react";

function CategoriasContent() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();
  const { data: products } = useProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-steel">Erro ao carregar categorias: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-dark hover:bg-ink/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderOpen className="h-12 w-12 text-stone mb-4" />
        <p className="text-steel">Nenhuma categoria encontrada.</p>
      </div>
    );
  }

  const categoriesWithImages = categories.map((cat) => {
    const rep = products?.find((p) => p.category?.id === cat.id) ?? null;
    return { category: cat, product: rep };
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {categoriesWithImages.map(({ category, product }) => {
        const imageUrl = category.image || product?.productMainImg;

        return (
          <Link
            key={category.id}
            href={`/produtos?categoria=${category.categorySlug}`}
            className="group/cat relative overflow-hidden rounded-xl"
          >
            <div className="aspect-[2/3] overflow-hidden bg-surface">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={category.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/cat:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-hero-dark-from to-hero-dark-to p-4">
                  <span className="text-center text-sm font-medium text-on-dark-muted">
                    {category.title}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-sm font-semibold text-on-dark">{category.title}</span>
              {category.subcategories && category.subcategories.length > 0 && (
                <span className="mt-1 block text-xs text-on-dark-muted">
                  {category.subcategories.length}{" "}
                  {category.subcategories.length === 1 ? "subcategoria" : "subcategorias"}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function CategoriasPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            Categorias
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Navegue por categorias e encontre o que mais combina com voce.
          </p>
          <div className="mt-12">
            <CategoriasContent />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
