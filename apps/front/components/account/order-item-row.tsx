import Link from "next/link";
import { formatPrice } from "@workspace/ui/lib/format-price";
import type { OrderItem } from "@/types/order";
import type { Product } from "@/types/product";
import { BlueprintSkeleton } from "@/components/ui/blueprint-skeleton";
import { Mono } from "@/components/ui/mono";
import { ProductImage } from "@/components/ui/product-image";

interface OrderItemRowProps {
  item: OrderItem;
  /** O item guarda só o `productId`; o resto vem do catálogo. */
  product?: Product;
  loading?: boolean;
}

/**
 * Uma linha do pedido. Enquanto o catálogo não chega o item fica em esqueleto —
 * antes disso ele aparecia como "Produto #123" e trocava de nome sozinho, o que
 * lia como erro em vez de carregamento.
 */
export function OrderItemRow({ item, product, loading }: OrderItemRowProps) {
  const pending = loading && !product;

  return (
    <div className="flex items-center gap-3.5">
      <div className="blueprint duotone size-[62px] flex-none">
        {pending ? (
          <BlueprintSkeleton className="size-full" />
        ) : (
          <ProductImage
            src={product?.productMainImg}
            alt={product?.name ?? `Produto #${item.productId}`}
            aspectRatio="1/1"
            sizes="62px"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-heading text-[17px] leading-tight">
          {pending ? (
            <BlueprintSkeleton className="h-[18px] w-2/3" />
          ) : product ? (
            <Link href={`/produtos/${product.id}`} className="hover:text-accent-700">
              {product.name}
            </Link>
          ) : (
            // Catálogo já carregado e o produto não está lá: saiu de linha.
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
}
