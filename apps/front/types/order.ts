/**
 * O que a Nest devolve nas rotas de cliente (`/orders`, `/customers/me`).
 * São os modelos do Prisma serializados: dinheiro em centavos, datas em ISO.
 *
 * Não deriva de `@workspace/database` de propósito: o front não é cliente do
 * banco (o catálogo vem do Payload, o resto vem da API por HTTP) e puxar o
 * Prisma para cá só pelos tipos traria o client junto. Além disso a forma na
 * rede difere do model — `Date` chega como `string`. Isto aqui é o contrato
 * do endpoint, não o schema; se a Nest mudar o retorno, mude aqui também.
 */

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "PREORDER";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "PAYPAL"
  | "STRIPE"
  | "APPLE_PAY"
  | "GOOGLE_PAY"
  | "PIX"
  | "BOLETO";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

/**
 * A cópia do endereço gravada no pedido. Não tem id: o pedido guarda o endereço
 * da entrega, e não uma referência à agenda do cliente — que ele pode editar ou
 * apagar sem mexer no histórico.
 */
export interface OrderAddress {
  street: string;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string | null;
}

export interface CustomerAddress {
  id: number;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  /** O endereço que o checkout usa como ponto de partida. */
  isDefault: boolean;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  picture: string | null;
  verifiedUser: boolean;
  createdAt: string;
  addresses: CustomerAddress[];
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  /** Snapshot do preço no momento da compra, em centavos. */
  unitPrice: number;
}

export interface OrderPayment {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  /** O que foi de fato cobrado — no PIX já vem com o desconto à vista. */
  amount: number;
  createdAt: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  /** Soma dos produtos, sem o desconto à vista. */
  subtotal: number;
  totalProducts: number;
  createdAt: string;
  items: OrderItem[];
  payments: OrderPayment[];
  address: OrderAddress | null;
}
