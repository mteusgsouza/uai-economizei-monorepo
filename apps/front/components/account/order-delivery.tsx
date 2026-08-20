import type { Order } from "@/types/order";
import { addressLines } from "@/lib/address";
import { Mono } from "@/components/ui/mono";

/**
 * Como o pedido chega às mãos do cliente: o endereço copiado no fechamento ou a
 * retirada no balcão.
 *
 * Quem decide é só o `retiraBalcao` — é o que o filtro do dashboard consulta, e
 * tela e filtro precisam concordar. Pedido de entrega sem endereço não deveria
 * existir; se aparecer, diz isso em vez de se passar por retirada.
 */
export function OrderDelivery({ order }: { order: Order }) {
  const lines = order.address ? addressLines(order.address) : [];

  return (
    <div className="border-t border-divider pt-3">
      <Mono as="div" className="text-ink/50">
        Entrega
      </Mono>
      <div className="mt-1 text-[15px] leading-normal">
        {order.retiraBalcao ? (
          <span>Retirada no balcão</span>
        ) : lines.length > 0 ? (
          lines.map((line) => <div key={line}>{line}</div>)
        ) : (
          <span className="text-ink/55">Endereço não registrado</span>
        )}
      </div>
    </div>
  );
}
