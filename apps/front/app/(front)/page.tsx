import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/layout/hero-section";
import { FeaturedProductsSection } from "@/components/product/featured-products-section";
import { CategoryProductSection } from "@/components/category/category-product-section";
import { CategoriesSection } from "@/components/category/categories-section";
import { BrandsSection } from "@/components/layout/brands-section";
import { SectionHeader } from "@/components/ui/section-header";
import { getHomeData } from "@/lib/catalog/home";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main>
        <HeroSection products={data.hero} />

        <section className="py-16 md:py-20 lg:py-24 bg-surface">
          <div className="mx-auto max-w-[1280px] px-8">
            <SectionHeader
              title="Mais Vendidos"
              description="Os produtos mais populares entre nossos clientes."
              href="/mais-vendidos"
            />
            <div className="mt-10">
              <FeaturedProductsSection limit={4} products={data.hero.slice(0, 4)} />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-8">
            <SectionHeader
              title="Novidades"
              description="Os produtos mais recentes adicionados a nossa colecao."
              href="/novidades"
            />
            <div className="mt-10">
              <FeaturedProductsSection limit={4} filter="new" products={data.newArrivals} />
            </div>
          </div>
        </section>

        <CategoryProductSection
          categorySlug="eletronicos"
          title="Eletronicos"
          products={data.categoryProducts.eletronicos}
        />
        <CategoryProductSection
          categorySlug="casa"
          title="Casa & Decoracao"
          products={data.categoryProducts.casa}
        />

        <CategoriesSection categories={data.categories} />
        <BrandsSection topBrands={data.topBrands} />
      </main>
      <SiteFooter />
    </div>
  );
}
