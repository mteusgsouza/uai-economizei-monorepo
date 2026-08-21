"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/http-client";
import type { Order } from "@/types/order";

/** Um pedido do cliente logado. `id` nulo desliga a busca. */
export function useOrder(id: number | null) {
  return useQuery<Order>({
    queryKey: ["customer", "order", id] as const,
    queryFn: () => api.get<Order>(`/orders/${id}`),
    enabled: id !== null,
    staleTime: 60 * 1000,
  });
}

/** Pedidos do cliente logado, do mais recente para o mais antigo. */
export function useOrders(enabled = true) {
  return useQuery<Order[]>({
    queryKey: ["customer", "orders"] as const,
    queryFn: () => api.get<Order[]>("/orders"),
    enabled,
    staleTime: 60 * 1000,
  });
}
