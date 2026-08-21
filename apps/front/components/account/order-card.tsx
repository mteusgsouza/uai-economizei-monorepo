"use client";

import type { ReactNode } from "react";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";
import { useCart } from "@/lib/cart-context";
import { Mono } from "@/components/ui/mono";
import { Tag } from "@/components/ui/tag";
import { OrderDelivery } from "./order-delivery";
import { OrderItemRow } from "./order-item-row";
import { OrderTimeline } from "./order-timeline";
import {
  statusLabel,
  formatOrderDate,
  orderTotal,
  paymentLabel,
  tagVariant,
} from "./order-status";

interface OrderCardProps {
  order: Order;
  /** Produtos resolvidos por id — o item do pedido só guarda `productId`. */
  products: Map<number, Product>;
  /** O catálogo chega depois dos pedidos; até lá os itens ficam em esqueleto. */
  productsLoading?: boolean;
  /**
   * O rodapé de ações. Ausente, mostra "Comprar de novo" — o caso da lista.
   * `null` remove a faixa: na confirmação, propor recomprar o que se acabou
   * de comprar não faz sentido.
   */
  actions?: ReactNode;
}

/** Um pedido inteiro: cabeçalho, itens comprados, entrega e o acompanhamento. */
export function OrderCard({
  order,
  products,
  productsLoading,
  actions,
}: OrderCardProps) {
  const { addItem } = useCart();
  const method = paymentLabel(order);
  const available = order.items
    .map((item) => ({ item, product: products.get(item.productId) }))
    .filter((entry): entry is { item: (typeof order.items)[number]; product: Product } =>
      Boolean(entry.product && entry.product.stock > 0),
    );

  // Sem o catálogo ainda não dá para saber o que está disponível — o botão fica
  // desabilitado, mas não anuncia indisponibilidade que pode não ser verdade.
  const soldOut = !productsLoading && available.length === 0;

  function buyAgain() {
    available.forEach(({ item, product }) => addItem(product, item.quantity));
    toast.success(
      available.length === order.items.length
        ? "Itens adicionados à sacola"
        : `${available.length} de ${order.items.length} itens ainda disponíveis`,
    );
  }

  return (
    <article className={cn("blueprint", order.status === "CANCELLED" && "opacity-70")}>
      <header
        className={cn(
          "flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-divider px-5 py-3.5",
          order.status === "SHIPPED" && "bg-accent-100/60",
        )}
      >
        <div>
          <Mono as="div" className="text-ink/50">
            Pedido
          </Mono>
          <div className="font-heading text-[19px] leading-tight">#{order.id}</div>
        </div>
        <div>
          <Mono as="div" className="text-ink/50">
            Data
          </Mono>
          <div className="text-sm">{formatOrderDate(order.createdAt)}</div>
        </div>
        <div>
          <Mono as="div" className="text-ink/50">
            Total
          </Mono>
          <div className="text-sm">
            {formatPrice(orderTotal(order))}
            {method ? ` · ${method}` : ""}
          </div>
        </div>
        <span className="flex-1" />
        <Tag variant={tagVariant(order.status)}>{statusLabel(order)}</Tag>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-3.5 p-5 lg:border-r lg:border-divider">
          {order.items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              product={products.get(item.productId)}
              loading={productsLoading}
            />
          ))}

          <OrderDelivery order={order} />

          {actions !== null && (
            <div className="flex flex-wrap gap-2.5 border-t border-divider pt-3">
              {actions ?? (
                <Button
                  variant="outline"
                  onClick={buyAgain}
                  disabled={productsLoading || soldOut}
                >
                  {soldOut ? "Itens indisponíveis" : "Comprar de novo"}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-divider p-5 lg:border-t-0">
          <OrderTimeline order={order} />
        </div>
      </div>
    </article>
  );
}
