import { SiteShell } from "@/components/layout/site-shell";
import { PromoCarousel } from "@/components/layout/promo-carousel";
import { StatsStrip } from "@/components/layout/stats-strip";
import { BrandsSection } from "@/components/layout/brands-section";
import { CategoriesSection } from "@/components/category/categories-section";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getHomeData } from "@/lib/catalog/home";
import { getPromotionShowcase } from "@/lib/catalog/promotions";
import { getStoreSettings } from "@/lib/catalog/settings";

export default async function HomePage() {
  const [data, showcase, settings] = await Promise.all([
    getHomeData(),
    getPromotionShowcase(),
    getStoreSettings(),
  ]);

  // O maior desconto vem do catálogo; se nenhum produto estiver com desconto,
  // vale o que as promoções anunciam ("até 45% off").
  const maxDiscount = Math.max(data.maxDiscountPercent, showcase.maxDiscountPercent);

  const stats = [
    maxDiscount > 0 && {
      value: `${Math.round(maxDiscount)}%`,
      label: "desconto máx.",
    },
    { value: `${settings.maxInstallments}x`, label: "sem juros" },
    { value: "48h", label: "entrega expressa" },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <SiteShell>
      <PromoCarousel showcase={showcase} />
      <StatsStrip stats={stats} />
      <CategoriesSection categories={data.categories} />

      {data.newArrivals.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 pt-14 md:px-10 md:pt-[72px]">
          <SectionHeader
            kicker="03 / Entradas"
            title="Novidades"
            href="/novidades"
            linkLabel="Ver todas"
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {data.newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pixDiscountPercent={settings.pixDiscountPercent}
                maxInstallments={settings.maxInstallments}
              />
            ))}
          </div>
        </section>
      )}

      <BrandsSection topBrands={data.topBrands} />
      <div className="pb-14 md:pb-[72px]" />
    </SiteShell>
  );
}
