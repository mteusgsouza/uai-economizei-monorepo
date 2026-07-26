import { Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/lib/catalog/products";

export default async function NovidadesPage() {
  const { docs: products } = await getProducts({ isNew: true, limit: 50 });

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            Novidades
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Os produtos mais recentes adicionados a nossa colecao.
          </p>
          <div className="mt-12">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Sparkles className="h-12 w-12 text-stone" />
                <p className="mt-4 text-steel">Nenhuma novidade no momento.</p>
                <p className="mt-1 text-sm text-stone">
                  Volte em breve para conferir novos produtos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
