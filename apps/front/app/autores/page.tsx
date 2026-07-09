"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCardCompact } from "@/components/product-card-compact";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { User, Users } from "lucide-react";

function AutoresContent() {
  const { data: products, isLoading, isError, error, refetch } = useProducts();

  if (isLoading) {
    return (
      <div className="space-y-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24 mb-6" />
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="shrink-0 w-[150px] aspect-[3/4] rounded-lg" />
              ))}
            </div>
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
        <Users className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhum autor encontrado.</p>
      </div>
    );
  }

  const authorCounts = new Map<string, number>();
  products.forEach((p) => {
    p.authors.forEach((author) => {
      authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
    });
  });

  const topAuthors = Array.from(authorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (topAuthors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Users className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhum autor encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {topAuthors.map(([author, count]) => {
        const authorProducts = products
          .filter((p) => p.authors.includes(author))
          .slice(0, 3);

        return (
          <div key={author}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-surface border border-hairline flex items-center justify-center">
                <User className="h-5 w-5 text-steel" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-ink">
                  {author}
                </h2>
                <p className="text-sm text-steel">
                  {count} {count === 1 ? "titulo" : "titulos"}
                </p>
              </div>
            </div>
            {authorProducts.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" as any }}>
                {authorProducts.map((product) => (
                  <ProductCardCompact key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AutoresPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            Autores
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Conheca os principais autores da nossa colecao.
          </p>
          <div className="mt-12">
            <AutoresContent />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
