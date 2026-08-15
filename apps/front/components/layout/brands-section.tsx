import Link from "next/link";
import type { HomeBrand } from "@/types/home";
import { SectionHeader } from "@/components/ui/section-header";

const MAX_CELLS = 6;

/**
 * As marcas como uma régua de nomes — só tipografia condensada numa grade de
 * células. O catálogo de cada marca vive na página de marcas, não aqui.
 */
export function BrandsSection({ topBrands }: { topBrands: HomeBrand[] }) {
  const shown = topBrands.slice(0, MAX_CELLS);
  if (shown.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-14 md:px-10 md:pt-[72px]">
      <SectionHeader
        kicker="04 / Fornecedores"
        title="Marcas"
        href="/marcas"
        linkLabel="Todas as marcas"
      />
      <div className="grid grid-cols-2 border border-divider sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((brand, i) => (
          <Link
            key={brand.id}
            href={`/produtos?marca=${encodeURIComponent(brand.name)}`}
            className={[
              "ccell border-divider px-4 py-6 text-center font-heading text-lg uppercase tracking-[0.08em] text-ink/70",
              (i + 1) % 2 !== 0 ? "border-r" : "",
              "sm:border-r",
              (i + 1) % 3 === 0 ? "sm:border-r-0" : "",
              "lg:border-r",
              i === shown.length - 1 ? "lg:border-r-0" : "",
              i < shown.length - 2 ? "border-b sm:border-b-0" : "",
            ].join(" ")}
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
