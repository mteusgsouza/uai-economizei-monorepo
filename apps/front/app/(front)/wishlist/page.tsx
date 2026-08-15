"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/auth/auth-guard";
import { AccountShell } from "@/components/account/account-shell";
import { WishlistCard } from "@/components/product/wishlist-card";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Mono } from "@/components/ui/mono";
import { Segmented } from "@/components/ui/segmented";
import { useProductsByIds } from "@/hooks/use-products";
import { useWishlist } from "@/hooks/use-wishlist";
import { useStoreSettings } from "@/lib/store-settings-context";
import type { Product } from "@/types/product";

type StockFilter = "todos" | "disponiveis" | "esgotados";

const FILTERS: { value: StockFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "disponiveis", label: "Disponíveis" },
  { value: "esgotados", label: "Sem estoque" },
];

function WishlistContent() {
  const { ids, remove } = useWishlist();
  const settings = useStoreSettings();
  const [filter, setFilter] = useState<StockFilter>("todos");
  const { data: catalog, isLoading } = useProductsByIds(ids, { enabled: ids.length > 0 });

  // A ordem da lista é a ordem em que o cliente salvou, não a do catálogo.
  const saved = ids
    .map((id) => catalog?.get(id))
    .filter((product): product is Product => product !== undefined);

  const visible = saved.filter((product) => {
    if (filter === "disponiveis") return product.stock > 0;
    if (filter === "esgotados") return product.stock <= 0;
    return true;
  });

  const loading = ids.length > 0 && isLoading;

  return (
    <AccountShell
      crumbs={[{ label: "Minha conta", href: "/conta" }, { label: "Favoritos" }]}
    >
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-4">
        <div>
          <h1 className="font-heading text-[32px] uppercase leading-none md:text-[38px]">
            Favoritos
          </h1>
          <Mono as="div" className="mt-1 text-ink/55">
            {ids.length} {ids.length === 1 ? "item salvo" : "itens salvos"}
          </Mono>
        </div>
        {ids.length > 0 && (
          <Segmented
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            aria-label="Filtrar favoritos por disponibilidade"
            className="max-w-full overflow-x-auto"
          />
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <BlueprintSkeleton key={index} className="h-80" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nada por aqui"
            description={
              ids.length === 0
                ? "Salve os produtos que te interessam para comparar preço depois."
                : "Nenhum favorito nessa situação."
            }
            actionLabel="Ver catálogo"
            actionHref="/produtos"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {visible.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                pixDiscountPercent={settings.pixDiscountPercent}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistContent />
    </RequireAuth>
  );
}
