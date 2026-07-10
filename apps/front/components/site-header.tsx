"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart-context";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categorias", label: "Categorias" },
  { href: "/mais-vendidos", label: "Mais Vendidos" },
  { href: "/novidades", label: "Novidades" },
  { href: "/marcas", label: "Marcas" },
] as const;

export function SiteHeader() {
  const { isAuthenticated, customer } = useAuth();
  const { itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-hairline-soft bg-canvas">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold text-ink">
            Economizei
          </Link>
          <nav className="hidden md:flex md:gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-steel hover:text-ink transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/wishlist"
                className="text-sm text-steel hover:text-ink transition-colors flex items-center gap-1"
              >
                <Heart className="h-3.5 w-3.5" />
                Wishlist
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex md:items-center md:gap-4">
          <Link href="/carrinho" className="relative text-steel hover:text-ink transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-on-dark">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <span className="text-sm text-steel">
              Ola{typeof customer?.firstName === 'string' && customer.firstName.length > 0 ? `, ${customer.firstName}` : ""}
            </span>
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 pt-12">
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-steel hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 text-sm text-steel hover:text-ink transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>
              )}
              <Separator className="bg-hairline" />
              <Link href="/carrinho" className="flex items-center gap-2 text-sm text-steel hover:text-ink transition-colors">
                <ShoppingCart className="h-4 w-4" />
                Carrinho
                {mounted && itemCount > 0 && (
                  <span className="ml-auto rounded-full bg-ink px-2 py-0.5 text-xs text-on-dark">
                    {itemCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <span className="text-sm text-steel">
                  Ola{typeof customer?.firstName === 'string' && customer.firstName.length > 0 ? `, ${customer.firstName}` : ""}
                </span>
              ) : (
                <Button variant="ghost" asChild className="justify-start p-0">
                  <Link href="/login">Entrar</Link>
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
