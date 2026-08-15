import Link from "next/link";
import type { Product } from "@/types/product";
import type { StoreSettings } from "@/lib/commerce";
import { EmptyState } from "@/components/ui/empty-state";
import { Mono } from "@/components/ui/mono";
import { ProductCard } from "./product-card";

interface ShowcasePageProps {
  title: string;
  /** Rótulo do breadcrumb depois de "Home". */
  crumb: string;
  products: Product[];
  settings: StoreSettings;
  emptyDescription: string;
}

/**
 * O enquadramento das vitrines simples (novidades, mais vendidos): breadcrumb,
 * título condensado com a contagem e a grade de cartões. As páginas que
 * precisam de filtro usam `/produtos`, não isto.
 */
export function ShowcasePage({
  title,
  crumb,
  products,
  settings,
  emptyDescription,
}: ShowcasePageProps) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-7 md:px-10 md:pb-[72px]">
      <Mono as="nav" className="block text-ink/50">
        <Link href="/" className="hover:text-accent-700">
          Home
        </Link>
        <span className="text-ink"> / {crumb}</span>
      </Mono>

      <div className="mt-3 border-b border-divider pb-4">
        <h1 className="font-heading text-[32px] uppercase leading-none md:text-[44px]">
          {title}
        </h1>
        <Mono as="div" className="mt-1 text-ink/55">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </Mono>
      </div>

      <div className="mt-7">
        {products.length === 0 ? (
          <EmptyState
            title="Nada por aqui"
            description={emptyDescription}
            actionLabel="Ver catálogo"
            actionHref="/produtos"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pixDiscountPercent={settings.pixDiscountPercent}
                maxInstallments={settings.maxInstallments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
