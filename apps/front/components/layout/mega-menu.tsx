import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryWithSubcategories } from "@/types/product";
import type { CategoryCounts } from "@/lib/catalog/taxonomy";
import { Mono } from "@/components/ui/mono";

/** Quatro colunas cabem na malha; o resto vive no índice completo. */
const COLUMNS = 4;
const SUBCATEGORIES_PER_COLUMN = 8;

interface MegaMenuProps {
  categories: CategoryWithSubcategories[];
  counts: CategoryCounts;
}

/**
 * O índice do catálogo aberto sobre a barra: uma coluna por categoria, com as
 * subcategorias listadas. Abre no hover e no foco do teclado — sem script,
 * pelas regras `.hasmenu` em brand.css.
 */
export function MegaMenu({ categories, counts }: MegaMenuProps) {
  const shown = categories.slice(0, COLUMNS);

  return (
    <div className="megamenu blueprint absolute left-[-24px] top-[calc(100%+16px)] z-20 w-[min(1088px,calc(100vw-64px))] bg-canvas p-3 shadow-[var(--shadow-md)]">
      <div
        className="grid border border-divider"
        style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0,1fr))` }}
      >
        {shown.map((category, index) => (
          <div
            key={category.id}
            className={index < shown.length - 1 ? "border-r border-divider p-3.5" : "p-3.5"}
          >
            <Mono as="div" className="mb-2.5 text-accent-700">
              {category.title}
            </Mono>
            <div className="flex flex-col gap-[7px] text-sm">
              {category.subcategories.slice(0, SUBCATEGORIES_PER_COLUMN).map((sub) => (
                <Link
                  key={sub.subcatSlug}
                  href={`/produtos?categoria=${category.categorySlug}&subcategoria=${sub.subcatSlug}`}
                  className="nav-link text-ink"
                >
                  {sub.title}
                </Link>
              ))}
              <Link
                href={`/produtos?categoria=${category.categorySlug}`}
                className="nav-link text-accent-700"
              >
                Ver tudo em {category.title.toLowerCase()}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center gap-2.5 px-1.5">
        <Mono className="text-ink/50">
          {counts.total.toLocaleString("pt-BR")} produtos em {categories.length}{" "}
          {categories.length === 1 ? "categoria" : "categorias"}
        </Mono>
        <span className="h-px flex-1 bg-divider" />
        <Link
          href="/categorias"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Ver índice completo
          <ArrowRight className="size-[15px]" />
        </Link>
      </div>
    </div>
  );
}
