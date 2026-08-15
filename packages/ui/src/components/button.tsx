import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Industry: o botão é um objeto de wireframe — quadrado, com fio de contorno e
 * título condensado. O primário é a única superfície sólida do sistema; os
 * demais são linha. Hovers e pressionados saem da rampa do aço.
 */
const buttonVariants = cva(
  "hover:cursor-pointer group/button inline-flex shrink-0 items-center justify-center gap-1.5 border border-divider bg-clip-padding font-heading text-sm font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground hover:border-accent-700 hover:bg-accent-700 active:bg-accent-800",
        outline:
          "bg-transparent hover:border-primary hover:bg-accent-100 active:bg-accent-200 aria-expanded:border-primary aria-expanded:bg-accent-100",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-neutral-200 aria-expanded:bg-neutral-200",
        ghost:
          "border-transparent text-primary hover:bg-accent-100 active:bg-accent-200 aria-expanded:bg-accent-100",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:outline-destructive",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      // 38px é a altura de linha do sistema: botão e campo se alinham lado a
      // lado nas barras de busca e nos formulários.
      size: {
        default: "h-[38px] px-3.5",
        xs: "h-7 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 px-6 text-[15px]",
        icon: "size-[38px] px-0",
        "icon-xs": "size-7 px-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 px-0",
        "icon-lg": "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
