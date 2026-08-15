import type { HomeCategory } from "@/types/home";
import { SectionHeader } from "@/components/ui/section-header";
import { CategoryCard } from "./category-card";

/** Quantas cabem na régua de seis colunas do desktop. */
const MAX_CELLS = 6;

/**
 * O índice de categorias como uma grade única: uma moldura por fora e fios
 * separando as células, sem cartões soltos.
 */
export function CategoriesSection({ categories }: { categories: HomeCategory[] }) {
  const shown = categories.slice(0, MAX_CELLS);
  if (shown.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-14 md:px-10 md:pt-[72px]">
      <SectionHeader
        kicker=""
        title="Categorias em destaque"
        href="/categorias"
        linkLabel="Ver todas"
      />
      <div className="grid grid-cols-2 border border-divider sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((category, i) => (
          <CategoryCard
            key={category.id}
            category={category}
            // Os fios internos são desenhados pelas próprias células: cada uma
            // ganha borda à direita e abaixo, menos nas bordas da grade.
            className={[
              "border-divider",
              (i + 1) % 2 !== 0 ? "border-r" : "",
              "sm:border-r",
              (i + 1) % 3 === 0 ? "sm:border-r-0" : "",
              "lg:border-r",
              i === shown.length - 1 ? "lg:border-r-0" : "",
              i < shown.length - 2 ? "border-b sm:border-b-0" : "",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
