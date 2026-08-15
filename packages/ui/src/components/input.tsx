import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Campo do Industry: 38px, fundo de superfície, fio de contorno e
        // cursor no aço. Foco desenha a borda, sem halo.
        "h-[38px] w-full min-w-0 border border-input bg-surface px-2.5 py-1.5 text-sm caret-primary transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-neutral-500 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
