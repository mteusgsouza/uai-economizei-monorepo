"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCardCompact } from "@/components/product-card-compact";
import { useBrands, useProducts } from "@/hooks/use-products";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Building2, Package } from "lucide-react";

function MarcasContent() {
  const { data: brands, isLoading: brandsLoading, isError: brandsError, error: brandsErr, refetch: refetchBrands } = useBrands();
  const { data: products, isLoading: productsLoading, isError: productsError, error: productsErr, refetch: refetchProducts } = useProducts();

  const isLoading = brandsLoading || productsLoading;
  const isError = brandsError || productsError;
  const error = brandsErr || productsErr;
  const refetch = () => { refetchBrands(); refetchProducts(); };

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
        <p className="text-steel">Erro ao carregar: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-dark"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhuma marca encontrada.</p>
      </div>
    );
  }

  const brandsWithCounts = brands
    .map((brand) => {
      const brandProducts = (products ?? []).filter((p) => p.brand?.id === brand.id);
      return { brand, products: brandProducts, count: brandProducts.length };
    })
    .sort((a, b) => b.count - a.count);

  if (brandsWithCounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package className="h-12 w-12 text-stone" />
        <p className="mt-4 text-steel">Nenhum produto encontrado para as marcas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {brandsWithCounts.map(({ brand, products: brandProducts, count }) => {
        return (
          <div key={brand.id}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-surface border border-hairline flex items-center justify-center">
                <Building2 className="h-5 w-5 text-steel" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-ink">
                  {brand.name}
                </h2>
                <p className="text-sm text-steel">
                  {count} {count === 1 ? "produto" : "produtos"}
                </p>
              </div>
            </div>
            {brandProducts.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" as any }}>
                {brandProducts.slice(0, 3).map((product) => (
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

export default function MarcasPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            Marcas
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Conheca as marcas da nossa colecao.
          </p>
          <div className="mt-12">
            <MarcasContent />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
