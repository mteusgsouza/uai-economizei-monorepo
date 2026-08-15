import { cn } from "@workspace/ui/lib/utils";
import type { Order } from "@/types/order";
import { Mono } from "@/components/ui/mono";
import { ORDER_FLOW, STEP_NOTE, flowIndex, formatOrderDate } from "./order-status";

/**
 * A linha do tempo do pedido, derivada só do `OrderStatus` — não há
 * transportadora nem código de rastreio no modelo, então cada etapa mostra o
 * que se sabe: a data do pedido na primeira e a posição atual no fluxo.
 */
export function OrderTimeline({ order }: { order: Order }) {
  const current = flowIndex(order.status);

  if (order.status === "CANCELLED") {
    return (
      <div>
        <Mono as="div" className="mb-3 text-ink/50">
          Situação
        </Mono>
        <div className="text-sm">Pedido cancelado</div>
        <Mono as="div" className="text-ink/50">
          {formatOrderDate(order.createdAt)}
        </Mono>
      </div>
    );
  }

  return (
    <div>
      <Mono as="div" className="mb-3.5 text-ink/50">
        Acompanhamento
      </Mono>
      <ol className="flex flex-col">
        {ORDER_FLOW.map((step, index) => {
          const done = index <= current;
          const isCurrent = index === current;
          const isLast = index === ORDER_FLOW.length - 1;

          return (
            <li key={step} className={cn("flex gap-3", !done && !isCurrent && "opacity-50")}>
              <div className="flex w-3.5 flex-col items-center">
                <span
                  className={cn(
                    "size-[9px] flex-none border",
                    done
                      ? "border-primary bg-primary"
                      : "border-ink/40 bg-canvas",
                  )}
                />
                {!isLast && (
                  <span
                    className={cn("w-px flex-1", done ? "bg-primary" : "bg-divider")}
                  />
                )}
              </div>
              <div className={cn(!isLast && "pb-4")}>
                <div className={cn("text-sm", isCurrent && "text-accent-700")}>
                  {STEP_NOTE[step]}
                </div>
                <Mono as="div" className="text-ink/50">
                  {index === 0
                    ? formatOrderDate(order.createdAt)
                    : isCurrent
                      ? "etapa atual"
                      : done
                        ? "concluída"
                        : "a caminho"}
                </Mono>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
