"use client";

import { useHomeData, type HomeData } from "@/hooks/use-products";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/layout/hero-section";
import { FeaturedProductsSection } from "@/components/product/featured-products-section";
import { CategoryProductSection } from "@/components/category/category-product-section";
import { CategoriesSection } from "@/components/category/categories-section";
import { BrandsSection } from "@/components/layout/brands-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { Skeleton } from "@workspace/ui/components/skeleton";

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative w-full min-h-[420px] md:min-h-[480px] bg-gradient-to-br from-hero-dark-from to-hero-dark-to flex items-center">
        <div className="mx-auto max-w-[1280px] px-8 w-full">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-10 w-3/4 bg-on-dark/10" />
            <Skeleton className="h-5 w-1/2 bg-on-dark/10" />
            <Skeleton className="h-12 w-40 rounded-full bg-on-dark/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <main>
      <HeroSkeleton />
      <section className="py-16 md:py-20 lg:py-24 bg-surface">
        <div className="mx-auto max-w-[1280px] px-8 space-y-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
          <ProductGridSkeleton count={4} />
        </div>
      </section>
      <section className="py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-8 space-y-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    </main>
  );
}

function HomeContent({ data }: { data: HomeData }) {
  return (
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
  );
}

export default function HomePage() {
  const { data: homeData, isLoading } = useHomeData();

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      {isLoading || !homeData ? <HomeSkeleton /> : <HomeContent data={homeData} />}
      <SiteFooter />
    </div>
  );
}
