import { cn } from "@workspace/ui/lib/utils";
import { Mono } from "@/components/ui/mono";

const STEPS = [
  { key: "entrega", title: "Entrega", note: "endereço e prazo" },
  { key: "pagamento", title: "Pagamento", note: "forma e dados" },
  { key: "revisao", title: "Revisão", note: "confirmar pedido" },
] as const;

export type CheckoutStep = (typeof STEPS)[number]["key"];

/**
 * Sem pagamento pelo site, o passo do meio não pede dado nenhum: só confere e
 * envia. Trocam-se os rótulos, nunca a key — ela é a rota, e `revisao` já está
 * ocupada pela página de sucesso.
 */
const QUOTE_STEP = { title: "Confirmação", note: "conferir e enviar" };

/**
 * As três etapas numa moldura só. A atual é a única tingida; as seguintes
 * ficam apagadas — dá para ver onde se está sem contar passos.
 */
export function CheckoutSteps({
  current,
  quoteMode = false,
}: {
  current: CheckoutStep;
  quoteMode?: boolean;
}) {
  const steps = STEPS.map((step) =>
    quoteMode && step.key === "pagamento" ? { ...step, ...QUOTE_STEP } : step,
  );
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="cgroup grid border border-divider sm:grid-cols-3">
      {steps.map((step, i) => {
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        return (
          <div
            key={step.key}
            className={cn(
              "flex items-center gap-2.5 px-4 py-3.5",
              i < steps.length - 1 && "border-b border-divider sm:border-b-0 sm:border-r",
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
