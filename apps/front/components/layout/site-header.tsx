"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu, Search, ShoppingCart } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@workspace/ui/lib/format-price";
import type { CategoryWithSubcategories } from "@/types/product";
import type { CategoryCounts } from "@/lib/catalog/taxonomy";
import type { StoreSettings } from "@/lib/commerce";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AccountMenu } from "./account-menu";
import { Logo } from "./logo";
import { MegaMenu } from "./mega-menu";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { SearchField } from "./search-field";
import { SECONDARY_LINKS } from "./nav-links";

interface SiteHeaderProps {
  categories: CategoryWithSubcategories[];
  counts: CategoryCounts;
  settings: StoreSettings;
}

/**
 * A barra do site e as duas gavetas que ela abre. O estado de abertura mora
 * aqui porque só o cabeçalho as dispara — sem contexto extra para isso.
 */
export function SiteHeader({ categories, counts, settings }: SiteHeaderProps) {
  const { isAuthenticated } = useAuth();
  const { items, itemCount, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.product.value * i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-canvas">
      {/* desktop */}
      <div className="mx-auto hidden max-w-[1280px] items-center gap-6 px-10 py-4 lg:flex">
        <Logo />

        <nav className="flex flex-none items-center gap-[18px] self-stretch text-sm">
          <div className="hasmenu relative flex items-center self-stretch">
            <Link
              href="/categorias"
              className="inline-flex items-center gap-1.5 text-primary hover:text-accent-700"
            >
              Categorias
              <ChevronDown className="size-3.5" />
            </Link>
            <MegaMenu categories={categories} counts={counts} />
          </div>
          {SECONDARY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 justify-end">
          <SearchField withButton className="max-w-[300px]" />
        </div>

        <div className="flex items-center gap-1.5">
          <AccountMenu />
          <Button variant="outline" size="icon" asChild aria-label="Favoritos">
            <Link href="/wishlist">
              <Heart className="size-[17px]" />
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="size-[17px]" />
            {hydrated && itemCount > 0
              ? `${itemCount} · ${formatPrice(subtotal)}`
              : "Carrinho"}
          </Button>
        </div>
      </div>

      {/* mobile */}
      <div className="flex items-center gap-3 px-4 py-2.5 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
        >
          <Menu className="size-[17px]" />
        </Button>
        <Logo size="sm" />
        <span className="flex-1" />
        <Button variant="outline" size="icon" asChild aria-label="Buscar">
          <Link href="/produtos">
            <Search className="size-[17px]" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCartOpen(true)}
          aria-label={`Carrinho${hydrated && itemCount > 0 ? ` (${itemCount})` : ""}`}
        >
          <ShoppingCart className="size-[17px]" />
        </Button>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        categories={categories}
        counts={counts}
        isAuthenticated={isAuthenticated}
      />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} settings={settings} />
    </header>
  );
}
