"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * O storefront é light-only — o sistema Industry é desenhado sobre um fundo
 * claro e não tem par escuro. O provider continua porque o Toaster
 * (`@workspace/ui/components/sonner`) lê `useTheme()`; ele só não oferece
 * mais escolha.
 */
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
