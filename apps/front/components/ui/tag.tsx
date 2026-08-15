import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Etiqueta pequena tingida a partir da rampa do aço — desconto, status,
 * subcategoria, forma de pagamento. Quadrada como todo objeto do sistema.
 *
 * Não é o `Badge` do shadcn: aqui o fundo é uma tinta clara da rampa com
 * texto no degrau escuro correspondente, combinação que o Badge não tem.
 */
const tagVariants = cva(
  "inline-flex items-center whitespace-nowrap px-2.5 py-[3px] text-[11px] leading-tight tracking-[0.02em]",
  {
    variants: {
      variant: {
        accent: "bg-accent-100 text-accent-800",
        neutral: "bg-neutral-100 text-neutral-800",
        outline: "border border-primary text-primary",
        solid: "bg-primary text-canvas",
      },
    },
    defaultVariants: { variant: "accent" },
  },
);

export function Tag<T extends ElementType = "span">({
  as,
  className,
  variant,
  ...props
}: { as?: T } & VariantProps<typeof tagVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">) {
  const Comp = (as ?? "span") as ElementType;

  return <Comp className={cn(tagVariants({ variant }), className)} {...props} />;
}
