"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { FreeShippingBar } from "@/components/cart/free-shipping-bar";
import { OrderSummary } from "@/components/cart/order-summary";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Mono } from "@/components/ui/mono";
import { useCart } from "@/lib/cart-context";
import { useStoreSettings } from "@/lib/store-settings-context";

function CartSkeleton() {
  return (
    <div className="blueprint p-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-divider py-4 last:border-b-0">
          <BlueprintSkeleton className="size-20 flex-none" />
          <div className="flex-1 space-y-2">
            <BlueprintSkeleton className="h-3 w-1/3" />
            <BlueprintSkeleton className="h-4 w-2/3" />
            <BlueprintSkeleton className="h-8 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  const { items, itemCount, hydrated } = useCart();
  const settings = useStoreSettings();

  const subtotal = items.reduce((sum, i) => sum + i.product.value * i.quantity, 0);
  const hasItems = items.length > 0;

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-7 md:px-10 md:pb-[72px]">
      <Mono as="nav" className="block text-ink/50">
        <Link href="/" className="hover:text-accent-700">
          Home
        </Link>
        <span className="text-ink"> / Carrinho</span>
      </Mono>

      <div className="mt-3 border-b border-divider pb-4">
        <h1 className="font-heading text-[32px] uppercase leading-none md:text-[44px]">
          Seu carrinho
        </h1>
        {hydrated && (
          <Mono as="div" className="mt-1 text-ink/55">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </Mono>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-7">
          <CartSkeleton />
        </div>
      ) : !hasItems ? (
        <div className="mt-7">
          <EmptyState
            title="Carrinho vazio"
            description="Os produtos que você adicionar aparecem aqui."
            actionLabel="Explorar catálogo"
            actionHref="/produtos"
          />
        </div>
      ) : (
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <div className="blueprint p-5">
              <FreeShippingBar subtotal={subtotal} settings={settings} />
              <div className="mt-4 first:mt-0">
                {items.map((item) => (
                  <CartItemCard key={item.product.id} item={item} />
                ))}
              </div>
            </div>

            <Link
              href="/produtos"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Continuar comprando
            </Link>
          </div>

          <div>
            <div className="lg:sticky lg:top-24">
              <OrderSummary />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
