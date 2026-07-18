"use client";

import Link from "next/link";
import { ShoppingCart, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCart } from "@/lib/cart-context";

function CartItemsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-28 w-20 flex-shrink-0 rounded-lg md:w-24" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  const { items, itemCount, hydrated } = useCart();

  const hasItems = items.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-7 w-7 text-ink" />
            <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
              Carrinho
            </h1>
            {hydrated && hasItems && (
              <span className="text-steel text-lg">
                ({itemCount} {itemCount === 1 ? "item" : "itens"})
              </span>
            )}
          </div>

          {!hydrated ? (
            <div className="mt-10">
              <CartItemsSkeleton />
            </div>
          ) : !hasItems ? (
            <div className="mt-20 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-16 w-16 text-stone" />
              <h2 className="mt-6 text-xl font-semibold text-ink">
                Seu carrinho esta vazio
              </h2>
              <p className="mt-2 text-steel">
                Explore nosso catalogo e encontre os melhores produtos.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link href="/">Explorar Catalogo</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-10 flex flex-col gap-10 lg:flex-row">
              <div className="flex-1">
                <div className="rounded-xl border border-hairline bg-surface p-6 flex flex-col gap-6">
                  {items.map((item, index) => (
                    <div key={item.product.id}>
                      <CartItemCard item={item} />
                      {index < items.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Continuar comprando
                  </Link>
                </div>
              </div>

              <div className="w-full lg:w-80">
                <div className="lg:sticky lg:top-24">
                  <OrderSummary />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
