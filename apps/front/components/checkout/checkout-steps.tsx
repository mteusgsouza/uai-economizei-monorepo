import { cn } from "@workspace/ui/lib/utils";
import { Mono } from "@/components/ui/mono";

const STEPS = [
  { key: "entrega", title: "Entrega", note: "endereço e prazo" },
  { key: "pagamento", title: "Pagamento", note: "forma e dados" },
  { key: "revisao", title: "Revisão", note: "confirmar pedido" },
] as const;

export type CheckoutStep = (typeof STEPS)[number]["key"];

/**
 * As três etapas numa moldura só. A atual é a única tingida; as seguintes
 * ficam apagadas — dá para ver onde se está sem contar passos.
 */
export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="cgroup grid border border-divider sm:grid-cols-3">
      {STEPS.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        return (
          <div
            key={step.key}
            className={cn(
              "flex items-center gap-2.5 px-4 py-3.5",
              i < STEPS.length - 1 && "border-b border-divider sm:border-b-0 sm:border-r",
              isCurrent && "bg-accent-100",
              isFuture && "opacity-50",
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "grid size-6 flex-none place-items-center font-heading text-[13px] leading-none text-canvas",
                isFuture ? "bg-ink/35" : "bg-primary",
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-heading text-[17px] uppercase leading-tight">
                {step.title}
              </div>
              <Mono
                as="div"
                className={isCurrent ? "text-accent-700" : "text-ink/50"}
              >
                {isCurrent ? "etapa atual" : step.note}
              </Mono>
            </div>
          </div>
        );
      })}
    </div>
  );
}
