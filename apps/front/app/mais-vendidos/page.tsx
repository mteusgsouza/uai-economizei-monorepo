"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Trophy } from "lucide-react";

const POPULAR_TAGS = ["bestseller", "popular", "destaque", "mais-vendidos"];

function MaisVendidosContent() {
  const { data: products, isLoading, isError, error, refetch } = useProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
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
        <Trophy className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhum produto encontrado.</p>
      </div>
    );
  }

  const popular = products.filter((p) =>
    p.tags?.some((tag) => POPULAR_TAGS.includes(tag.toLowerCase())),
  );

  const displayProducts = popular.length > 0 ? popular : products;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function MaisVendidosPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            Mais Vendidos
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Os titulos mais populares entre nossos leitores.
          </p>
          <div className="mt-12">
            <MaisVendidosContent />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
