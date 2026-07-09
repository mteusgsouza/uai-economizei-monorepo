import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "@/components/hero-section";
import { FeaturedProductsSection } from "@/components/featured-products-section";
import { TypeSection } from "@/components/type-section";
import { CategoriesSection } from "@/components/categories-section";
import { AuthorsSection } from "@/components/authors-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main>
        <HeroSection />
        <section className="py-16 md:py-20 lg:py-24 bg-surface">
          <div className="mx-auto max-w-[1280px] px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
                  Mais Vendidos
                </h2>
                <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
                  Os titulos mais populares entre nossos leitores.
                </p>
              </div>
              <Link
                href="/mais-vendidos"
                className="text-sm font-medium text-steel hover:text-ink transition-colors shrink-0"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-10">
              <FeaturedProductsSection limit={4} />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink">
                  Novidades
                </h2>
                <p className="mt-3 max-w-lg text-lg leading-relaxed text-steel">
                  Os titulos mais recentes adicionados a nossa colecao.
                </p>
              </div>
              <Link
                href="/novidades"
                className="text-sm font-medium text-steel hover:text-ink transition-colors shrink-0"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-10">
              <FeaturedProductsSection limit={4} />
            </div>
          </div>
        </section>

        <TypeSection typeOfWork="Book" title="Livros" />
        <TypeSection typeOfWork="Comic" title="Quadrinhos" />
        <TypeSection typeOfWork="Game" title="Games" />
        <TypeSection typeOfWork="eBook" title="eBooks" />

        <CategoriesSection />
        <AuthorsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
