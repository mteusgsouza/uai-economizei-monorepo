"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@workspace/ui/lib/format-price";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";
import { useCart } from "@/lib/cart-context";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";
import { Tag } from "@/components/ui/tag";
import { OrderTimeline } from "./order-timeline";
import {
  STATUS_LABEL,
  formatOrderDate,
  orderTotal,
  paymentLabel,
  tagVariant,
} from "./order-status";

interface OrderCardProps {
  order: Order;
  /** Produtos resolvidos por id — o item do pedido só guarda `productId`. */
  products: Map<number, Product>;
}

/** Um pedido inteiro: cabeçalho, itens comprados e o acompanhamento. */
export function OrderCard({ order, products }: OrderCardProps) {
  const { addItem } = useCart();
  const method = paymentLabel(order);
  const available = order.items
    .map((item) => ({ item, product: products.get(item.productId) }))
    .filter((entry): entry is { item: (typeof order.items)[number]; product: Product } =>
      Boolean(entry.product && entry.product.stock > 0),
    );

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
        <Tag variant={tagVariant(order.status)}>{STATUS_LABEL[order.status]}</Tag>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-3.5 p-5 lg:border-r lg:border-divider">
          {order.items.map((item) => {
            const product = products.get(item.productId);
            return (
              <div key={item.id} className="flex items-center gap-3.5">
                <div className="blueprint duotone size-[62px] flex-none">
                  <ProductImage
                    src={product?.productMainImg}
                    alt={product?.name ?? `Produto #${item.productId}`}
                    aspectRatio="1/1"
                    sizes="62px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading text-[17px] leading-tight">
                    {product ? (
                      <Link href={`/produtos/${product.id}`} className="hover:text-accent-700">
                        {product.name}
                      </Link>
                    ) : (
                      `Produto #${item.productId}`
                    )}
                  </div>
                  <Mono as="div" className="text-ink/50">
                    {item.quantity} un · {formatPrice(item.unitPrice)} cada
                  </Mono>
                </div>
                <div className="font-heading text-[17px]">
                  {formatPrice(item.unitPrice * item.quantity)}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2.5 border-t border-divider pt-3">
            <Button variant="outline" onClick={buyAgain} disabled={available.length === 0}>
              {available.length === 0 ? "Itens indisponíveis" : "Comprar de novo"}
            </Button>
            {order.address && (
              <Mono as="span" className="self-center text-ink/50">
                {order.address.city} / {order.address.state} · {order.address.postalCode}
              </Mono>
            )}
          </div>
        </div>

        <div className="border-t border-divider p-5 lg:border-t-0">
          <OrderTimeline order={order} />
        </div>
      </div>
    </article>
  );
}
