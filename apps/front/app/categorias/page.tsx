"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HorizontalScroll } from "@/components/horizontal-scroll";
import { CategoryCard } from "@/components/product-card-compact";
import { useProducts } from "@/hooks/use-products";
import { GENRE_LABELS } from "@/types/product";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { BookOpen } from "lucide-react";

function CategoriasContent() {
  const { data: products, isLoading, isError, error, refetch } = useProducts();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="shrink-0 w-[200px] aspect-[2/3] rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-steel">Erro ao carregar produtos: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-dark"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhum produto encontrado.</p>
      </div>
    );
  }

  const genreEntries = Object.entries(GENRE_LABELS);

  const latestPerGenre = genreEntries
    .map(([genre, label]) => {
      const latest = products.find((p) => p.genre === genre);
      return latest ? { genre, label, product: latest } : null;
    })
    .filter((entry): entry is { genre: string; label: string; product: typeof products[number] } => entry !== null);

  if (latestPerGenre.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhuma categoria encontrada.</p>
      </div>
    );
  }

  return (
    <HorizontalScroll title="" href="">
      {latestPerGenre.map(({ genre, label, product }) => (
        <CategoryCard key={genre} genre={genre} label={label} product={product} />
      ))}
    </HorizontalScroll>
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
            Navegue por generos e encontre o que mais combina com voce.
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
