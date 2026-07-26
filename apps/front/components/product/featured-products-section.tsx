"use client";

import { useHomeProducts, useNewProducts } from "@/hooks/use-products";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";

interface FeaturedProductsSectionProps {
  limit?: number;
  filter?: "new";
  products?: Product[];
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-steel">Erro ao carregar produtos: {message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-on-dark"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-steel">Nenhum produto encontrado.</p>
    </div>
  );
}

export function FeaturedProductsSection({ limit = 4, filter, products: externalProducts }: FeaturedProductsSectionProps) {
  const isNew = filter === "new";
  const hasExternalData = externalProducts !== undefined;

  // Só chama o hook necessário — evita request inútil
  const homeQuery = useHomeProducts(limit, { enabled: !hasExternalData && !isNew });
  const newQuery = useNewProducts(limit, { enabled: !hasExternalData && isNew });

  const activeQuery = isNew ? newQuery : homeQuery;
  const { data: internalProducts, isLoading, isError, error, refetch } = activeQuery;
  const products = externalProducts ?? internalProducts;

  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (isError) {
    return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />;
  }

  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.slice(0, limit).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
