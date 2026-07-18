import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/layout/hero-section";
import { FeaturedProductsSection } from "@/components/product/featured-products-section";
import { CategoryProductSection } from "@/components/category/category-product-section";
import { CategoriesSection } from "@/components/category/categories-section";
import { BrandsSection } from "@/components/layout/brands-section";
import { SectionHeader } from "@/components/ui/section-header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main>
        <HeroSection />
        <section className="py-16 md:py-20 lg:py-24 bg-surface">
          <div className="mx-auto max-w-[1280px] px-8">
            <SectionHeader
              title="Mais Vendidos"
              description="Os produtos mais populares entre nossos clientes."
              href="/mais-vendidos"
            />
            <div className="mt-10">
              <FeaturedProductsSection limit={4} />
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
              <FeaturedProductsSection limit={4} filter="new" />
            </div>
          </div>
        </section>

        <CategoryProductSection categorySlug="eletronicos" title="Eletronicos" />
        <CategoryProductSection categorySlug="casa" title="Casa & Decoracao" />

        <CategoriesSection />
        <BrandsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
