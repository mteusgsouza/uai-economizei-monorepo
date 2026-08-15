"use client";

import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet";
import type { CategoryWithSubcategories } from "@/types/product";
import type { CategoryCounts } from "@/lib/catalog/taxonomy";
import { Mono } from "@/components/ui/mono";
import { Logo } from "./logo";
import { SearchField } from "./search-field";
import { SECONDARY_LINKS } from "./nav-links";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryWithSubcategories[];
  counts: CategoryCounts;
  isAuthenticated: boolean;
}

/** Navegação em gaveta: categorias em accordion nativo, busca e conta. */
export function MobileNavDrawer({
  open,
  onOpenChange,
  categories,
  counts,
  isAuthenticated,
}: MobileNavDrawerProps) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        // `!` para vencer o `data-[side=left]:w-3/4` do SheetContent, que tem
        // especificidade de seletor de atributo.
        className="flex w-[330px]! max-w-full flex-col gap-0 border-r border-divider bg-canvas p-0"
      >
        <div className="flex items-center gap-2.5 border-b border-divider px-3.5 py-2.5">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo size="sm" href={null} />
          <Button
            variant="outline"
            size="icon"
            className="ml-auto"
            onClick={close}
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="border-b border-divider px-3.5 py-3">
          <SearchField onSubmitted={close} />
        </div>

        <div className="flex-1 overflow-auto">
          {categories.map((category) => (
            <details key={category.id} className="acc border-b border-divider">
              <summary className="flex items-center gap-2 px-3.5 py-3 font-heading text-lg uppercase">
                {category.title}
                <span className="flex-1" />
                <Mono className="text-ink/45">
                  {counts.byCategory[category.categorySlug] ?? 0}
                </Mono>
                <ChevronDown className="chev size-4" />
              </summary>
              <div className="mx-3.5 mb-3 flex flex-col gap-2.5 border-l-2 border-primary pl-3 text-sm">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.subcatSlug}
                    href={`/produtos?categoria=${category.categorySlug}&subcategoria=${sub.subcatSlug}`}
                    className="nav-link text-ink"
                    onClick={close}
                  >
                    {sub.title}
                  </Link>
                ))}
                <Link
                  href={`/produtos?categoria=${category.categorySlug}`}
                  className="nav-link text-accent-700"
                  onClick={close}
                >
                  Ver tudo
                </Link>
              </div>
            </details>
          ))}

          {SECONDARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="block border-b border-divider px-3.5 py-3 font-heading text-lg uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-divider p-3.5">
          <Button asChild className="w-full py-3">
            <Link href={isAuthenticated ? "/conta" : "/login"} onClick={close}>
              {isAuthenticated ? "Minha conta" : "Entrar na conta"}
            </Link>
          </Button>
          {isAuthenticated && (
            <Button asChild variant="outline" className="w-full py-3">
              <Link href="/pedidos" onClick={close}>
                Meus pedidos
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
