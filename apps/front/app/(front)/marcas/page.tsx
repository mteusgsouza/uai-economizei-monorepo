import { Building2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCardCompact } from "@/components/product/product-card-compact";
import { getBrands } from "@/lib/catalog/taxonomy";
import { getProducts } from "@/lib/catalog/products";

export default async function MarcasPage() {
  const [brands, { docs: products }] = await Promise.all([
    getBrands(),
    getProducts({ limit: 200 }),
  ]);

  const brandsWithCounts = brands
    .map((brand) => {
      const brandProducts = products.filter((p) => p.brand?.id === brand.id);
      return { brand, products: brandProducts, count: brandProducts.length };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
            Marcas
          </h1>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
            Conheca as marcas da nossa colecao.
          </p>
          <div className="mt-12">
            {brandsWithCounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Building2 className="h-12 w-12 text-stone" />
                <p className="mt-4 text-steel">Nenhuma marca encontrada.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {brandsWithCounts.map(({ brand, products: brandProducts, count }) => (
                  <div key={brand.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-full bg-surface border border-hairline flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-steel" />
                      </div>
                      <div>
                        <h2 className="font-heading text-xl font-semibold text-ink">
                          {brand.name}
                        </h2>
                        <p className="text-sm text-steel">
                          {count} {count === 1 ? "produto" : "produtos"}
                        </p>
                      </div>
                    </div>
                    {brandProducts.length > 0 && (
                      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {brandProducts.slice(0, 3).map((product) => (
                          <ProductCardCompact key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </div>
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
