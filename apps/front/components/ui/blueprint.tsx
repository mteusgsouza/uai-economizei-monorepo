import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

/**
 * A moldura de wireframe do sistema: quadrada, contornada por um fio de
 * cabelo. Cards e figuras são desenhados assim — nunca blocos preenchidos e
 * arredondados.
 *
 * As marcas de registro `+` nos cantos existiam apenas no mockup, como apoio
 * de visualização; o design exportado as desliga.
 */
interface BlueprintProps {
  children?: ReactNode;
  className?: string;
}

export function Blueprint<T extends ElementType = "div">({
  as,
  children,
  className,
  ...props
}: BlueprintProps & { as?: T } & Omit<
    ComponentPropsWithoutRef<T>,
    keyof BlueprintProps | "as"
  >) {
  const Comp = (as ?? "div") as ElementType;

  return (
    <Comp className={cn("blueprint", className)} {...props}>
      {children}
    </Comp>
  );
}
