"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth-guard";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/hooks/use-wishlist";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Heart, X, BookOpen } from "lucide-react";

function WishlistContent() {
  const { ids, remove } = useWishlist();
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <SiteHeader />
        <main className="flex-1 py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-8">
            <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Wishlist
            </h1>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const wishlistProducts = (products ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex items-center gap-3">
            <Heart className="h-7 w-7 text-brand-error" fill="currentColor" />
            <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Wishlist
            </h1>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center text-center">
              <BookOpen className="h-16 w-16 text-stone" />
              <h2 className="mt-6 text-xl font-semibold text-ink">
                Sua wishlist esta vazia
              </h2>
              <p className="mt-2 text-steel">
                Salve seus titulos favoritos para encontra-los facilmente.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link href="/#produtos">Explorar Catalogo</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="relative group/wishlist">
                  <ProductCard product={product} />
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-canvas/90 backdrop-blur-sm border border-hairline flex items-center justify-center text-steel hover:text-brand-error hover:border-brand-error/30 transition-colors opacity-0 group-hover/wishlist:opacity-100"
                    aria-label={`Remover ${product.name} da wishlist`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistContent />
    </RequireAuth>
  );
}
