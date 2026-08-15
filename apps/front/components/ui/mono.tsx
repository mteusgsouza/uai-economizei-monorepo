import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Rótulo de ficha técnica: monoespaçada, caixa-alta, entrelinha aberta. É como
 * o sistema escreve metadado — breadcrumb, contagem, período de campanha,
 * preço PIX. Nunca use para texto corrido.
 */
export function Mono<T extends ElementType = "span">({
  as,
  className,
  ...props
}: { as?: T } & ComponentPropsWithoutRef<T>) {
  const Comp = (as ?? "span") as ElementType;

  return (
    <Comp
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.14em] leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
