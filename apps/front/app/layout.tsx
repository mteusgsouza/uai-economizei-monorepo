import { Geist, Geist_Mono, Figtree } from "next/font/google"

import "@workspace/ui/globals.css"
import "./brand.css";
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { CheckoutProvider } from "@/lib/checkout-context"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { Toaster } from "@workspace/ui/components/sonner"

const figtreeHeading = Figtree({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, figtreeHeading.variable)}
    >
      <body>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              <CartProvider>
                <CheckoutProvider>
                  <TooltipProvider>
                    {children}
                  </TooltipProvider>
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
