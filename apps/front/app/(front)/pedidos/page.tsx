"use client";

import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/auth-guard";
import { AccountShell } from "@/components/account/account-shell";
import { OrderCard } from "@/components/account/order-card";
import { matchesFilter, type StatusFilter } from "@/components/account/order-status";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Mono } from "@/components/ui/mono";
import { Segmented } from "@/components/ui/segmented";
import { useOrders } from "@/hooks/use-orders";
import { useProductsByIds } from "@/hooks/use-products";
import type { Product } from "@/types/product";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "andamento", label: "Em andamento" },
  { value: "entregues", label: "Entregues" },
  { value: "cancelados", label: "Cancelados" },
];

function OrdersContent() {
  const [filter, setFilter] = useState<StatusFilter>("todos");
  const { data: orders, isLoading } = useOrders();

  const productIds = useMemo(
    () => (orders ?? []).flatMap((order) => order.items.map((item) => item.productId)),
    [orders],
  );
  const { data: products, isLoading: loadingProducts } = useProductsByIds(productIds, {
    enabled: productIds.length > 0,
  });

  const visible = (orders ?? []).filter((order) => matchesFilter(order, filter));
  const catalog = products ?? new Map<number, Product>();

  return (
    <AccountShell crumbs={[{ label: "Minha conta", href: "/conta" }, { label: "Pedidos" }]}>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-4">
        <div>
          <h1 className="font-heading text-[32px] uppercase leading-none md:text-[38px]">
            Meus pedidos
          </h1>
          <Mono as="div" className="mt-1 text-ink/55">
            {orders?.length ?? 0} {orders?.length === 1 ? "pedido" : "pedidos"}
          </Mono>
        </div>
        <Segmented
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          aria-label="Filtrar pedidos por situação"
          className="max-w-full overflow-x-auto"
        />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {isLoading ? (
          <>
            <BlueprintSkeleton className="h-56" />
            <BlueprintSkeleton className="h-56" />
          </>
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nada por aqui"
            description={
              orders && orders.length > 0
                ? "Nenhum pedido nessa situação."
                : "Seus pedidos aparecem aqui assim que a primeira compra for fechada."
            }
            actionLabel="Ver catálogo"
            actionHref="/produtos"
          />
        ) : (
          visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              products={catalog}
              productsLoading={loadingProducts}
            />
          ))
        )}
      </div>
    </AccountShell>
  );
}

export default function PedidosPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}
