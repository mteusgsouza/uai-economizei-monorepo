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

type FlowStep = (typeof ORDER_FLOW)[number];

/** Descrição de cada etapa na linha do tempo, no caso comum. */
const STEP_NOTE: Record<FlowStep, string> = {
  PENDING: "Pedido registrado",
  CONFIRMED: "Pagamento aprovado",
  SHIPPED: "Saiu para entrega",
  DELIVERED: "Entregue no endereço",
};

/**
 * Orçamento é pedido sem pagamento gravado — a loja desligou o pagamento
 * pelo site e o acerto aconteceu fora dele. Mesma leitura que o admin faz.
 */
function isQuote(order: Order): boolean {
  return order.payments.length === 0;
}

/**
 * O que o pedido é muda o que cada etapa quer dizer: quem retira no balcão
 * nunca "sai para entrega", e orçamento não tem pagamento a aprovar.
 */
export function stepNote(order: Order, step: FlowStep): string {
  if (step === "CONFIRMED" && isQuote(order)) return "Pedido confirmado";
  if (order.retiraBalcao) {
    if (step === "SHIPPED") return "Separado para retirada";
    if (step === "DELIVERED") return "Retirado na loja";
  }
  return STEP_NOTE[step];
}

/** O rótulo da etiqueta, pelas mesmas regras. */
export function statusLabel(order: Order): string {
  if (isQuote(order)) {
    if (order.status === "PENDING") return "Aguardando confirmação";
    if (order.status === "CONFIRMED") return "Pedido confirmado";
  }
  if (order.retiraBalcao) {
    if (order.status === "SHIPPED") return "Pronto para retirada";
    if (order.status === "DELIVERED") return "Retirado";
  }
  return STATUS_LABEL[order.status];
}

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

/**
 * A cor da etiqueta carrega o significado, como no badge do admin: a vitrine
 * é cinza inteira, então status em neutro não se lê de relance.
 */
export function tagVariant(
  status: OrderStatus,
): "info" | "neutral" | "warning" | "success" | "danger" {
  if (status === "PENDING") return "warning";
  if (status === "CONFIRMED" || status === "SHIPPED") return "info";
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
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
