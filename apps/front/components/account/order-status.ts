import type { Order, OrderStatus, PaymentMethod } from "@/types/order";

/**
 * A leitura do pedido para o cliente. Não há transportadora nem código de
 * rastreio no modelo: tudo o que a tela mostra é derivado do `OrderStatus` e
 * dos pagamentos gravados na Nest.
 */

/** O caminho normal de um pedido. Cancelado e pré-venda saem do fluxo. */
export const ORDER_FLOW = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
] as const satisfies readonly OrderStatus[];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  CONFIRMED: "Pagamento confirmado",
  SHIPPED: "Em trânsito",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  PREORDER: "Pré-venda",
};

/** Descrição de cada etapa na linha do tempo. */
export const STEP_NOTE: Record<(typeof ORDER_FLOW)[number], string> = {
  PENDING: "Pedido registrado",
  CONFIRMED: "Pagamento aprovado",
  SHIPPED: "Saiu para entrega",
  DELIVERED: "Entregue no endereço",
};

export type StatusFilter = "todos" | "andamento" | "entregues" | "cancelados";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  PIX: "PIX",
  BOLETO: "boleto",
  CREDIT_CARD: "cartão",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
};

/** Posição no fluxo; `-1` para pedido fora dele (cancelado, pré-venda). */
export function flowIndex(status: OrderStatus): number {
  return ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
}

export function tagVariant(status: OrderStatus): "accent" | "neutral" | "outline" {
  if (status === "SHIPPED") return "accent";
  if (status === "CANCELLED") return "outline";
  return "neutral";
}

/** O que foi cobrado: o pagamento manda; sem ele, sobra a soma dos produtos. */
export function orderTotal(order: Order): number {
  return order.payments[0]?.amount ?? order.subtotal;
}

export function paymentLabel(order: Order): string | null {
  const method = order.payments[0]?.method;
  return method ? PAYMENT_LABEL[method] : null;
}

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(iso))
    .replace(".", "");
}

export function matchesFilter(order: Order, filter: StatusFilter): boolean {
  if (filter === "todos") return true;
  if (filter === "entregues") return order.status === "DELIVERED";
  if (filter === "cancelados") return order.status === "CANCELLED";
  return !["DELIVERED", "CANCELLED"].includes(order.status);
}
