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
        // `neutral-100` é #f5f5f8 sobre um canvas #f2f2f3: a cor existia, mas
        // não se via. Etiqueta precisa destacar do fundo.
        neutral: "bg-neutral-200 text-neutral-800",
        // Status usa a paleta pronta do Tailwind: cor cheia, porque a
        // etiqueta fica sobre um canvas claro e tinta clara some no fundo.
        info: "bg-sky-600 text-white",
        warning: "bg-yellow-600 text-white",
        success: "bg-emerald-600 text-white",
        danger: "bg-red-600 text-white",
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
