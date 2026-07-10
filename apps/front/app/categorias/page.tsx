"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCategories } from "@/hooks/use-products";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

function CategoriasContent() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-steel">Erro ao carregar categorias: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-dark"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FolderOpen className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhuma categoria encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <div key={category.id}>
          <Link
            href={`/categorias/${category.categorySlug}`}
            className="group inline-block"
          >
            <h2 className="font-heading text-2xl font-semibold text-ink group-hover:text-brand-green transition-colors">
              {category.title}
            </h2>
          </Link>

          {category.subcategories && category.subcategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categorias/${category.categorySlug}?sub=${sub.subcatSlug}`}
                  className="inline-flex items-center rounded-full border border-hairline bg-surface px-3 py-1 text-sm text-steel hover:text-ink hover:border-steel transition-colors"
                >
                  {sub.title}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-1 border-b border-hairline pt-6" />
        </div>
      ))}
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
