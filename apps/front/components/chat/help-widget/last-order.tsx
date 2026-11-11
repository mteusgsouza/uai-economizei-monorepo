"use client";

import Link from "next/link";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { Tag } from "@/components/ui/tag";
import {
  formatOrderDate,
  orderTotal,
  statusLabel,
  tagVariant,
} from "@/components/account/order-status";
import { useAuth } from "@/lib/use-auth";
import { withRedirect } from "@/lib/auth-redirect";
import { useOrders } from "@/hooks/use-orders";
import { ChatBubble, ChatOptionButton } from "../chat-bubbles";

export function LastOrder({ open }: { open: boolean }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const orders = useOrders(open && isAuthenticated);

  if (authLoading) return <ChatBubble role="assistant">Carregando…</ChatBubble>;

  if (!isAuthenticated) {
    return (
      <>
        <ChatBubble role="assistant">Entre na sua conta para ver sua última compra.</ChatBubble>
        <ChatOptionButton asChild>
          <Link href={withRedirect("/login", "/pedidos")}>Entrar</Link>
        </ChatOptionButton>
      </>
    );
  }

  if (orders.isLoading) return <ChatBubble role="assistant">Buscando seu pedido…</ChatBubble>;

  if (orders.isError) {
    return (
      <ChatBubble role="assistant">
        Não consegui carregar seus pedidos agora. Tente de novo em instantes.
      </ChatBubble>
    );
  }

  // A API devolve do mais novo para o mais antigo.
  const order = orders.data?.[0];
  if (!order) {
    return <ChatBubble role="assistant">Você ainda não fez nenhuma compra.</ChatBubble>;
  }

  return (
    <>
      <ChatBubble role="assistant">
        {`Pedido #${order.id} · ${formatOrderDate(order.createdAt)}\nTotal: ${formatPrice(orderTotal(order))}`}
      </ChatBubble>
      <div>
        <Tag variant={tagVariant(order.status)}>{statusLabel(order)}</Tag>
      </div>
      <ChatOptionButton asChild>
        <Link href="/pedidos">Ver detalhes</Link>
      </ChatOptionButton>
    </>
  );
}
