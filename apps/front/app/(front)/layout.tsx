import { Barlow, Barlow_Condensed, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import "./brand.css";
import { ThemeProvider } from "@/components/layout/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { CheckoutProvider } from "@/lib/checkout-context"
import { StoreSettingsProvider } from "@/lib/store-settings-context"
import { getStoreSettings } from "@/lib/catalog/settings"
import { themeCss } from "@/lib/theme"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "@workspace/ui/components/sonner"

// Barlow Condensed nos títulos sobre Barlow no corpo — o par do sistema Industry.
const fontHeading = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-heading",
})

const fontBody = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
})

// Os rótulos de ficha técnica (`.mono`) rodam em monoespaçada.
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Lido uma vez aqui (com cache) e entregue por contexto: carrinho, checkout
  // e resumo são client components e precisam dessas regras.
  const settings = await getStoreSettings()

  // A aparência escolhida no admin entra como override de tokens. Vai no <head>,
  // depois do brand.css, para vencer os valores padrão sem piscar a cor antiga
  // — e some por completo quando a loja não escolheu nada.
  const theme = themeCss(settings.theme)

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased font-sans",
        fontBody.variable,
        fontHeading.variable,
        fontMono.variable,
      )}
    >
      {theme && (
        <head>
          <style id="uai-theme" dangerouslySetInnerHTML={{ __html: theme }} />
        </head>
      )}
      <body>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              <CartProvider>
                <CheckoutProvider>
                  <StoreSettingsProvider value={settings}>
                    <TooltipProvider>
                      {children}
                    </TooltipProvider>
                  </StoreSettingsProvider>
                </CheckoutProvider>
              </CartProvider>
              <Toaster />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
