"use client";

import type { CategoryWithSubcategories } from "@/types/product";
import { Mono } from "@/components/ui/mono";
import { useFilterParams } from "./use-filter-params";

interface SubcategoryBandProps {
  category: CategoryWithSubcategories;
  counts: Record<string, number>;
}

/**
 * A régua de subcategorias sob o título. Somam entre si: marcar duas mostra os
 * produtos das duas. As ativas são as preenchidas de aço.
 */
export function SubcategoryBand({ category, counts }: SubcategoryBandProps) {
  const { getList, toggleInList } = useFilterParams();
  const active = getList("subcategoria");

  // Subcategoria sem produto é beco sem saída: a taxonomia existe no admin,
  // mas enquanto ninguém classificar os produtos ela não vira navegação.
  const shown = category.subcategories.filter(
    (sub) => (counts[sub.subcatSlug] ?? 0) > 0 || active.includes(sub.subcatSlug),
  );
  if (shown.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 border-y border-divider py-4 lg:flex-row lg:items-center lg:gap-4">
      <div className="flex-none">
        <Mono as="div" className="text-ink/50">
          Subcategorias
        </Mono>
        <div className="font-heading text-[19px] uppercase leading-tight">
          {category.title}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((sub) => {
          const on = active.includes(sub.subcatSlug);
          return (
            <button
              key={sub.subcatSlug}
              type="button"
              onClick={() => toggleInList("subcategoria", sub.subcatSlug)}
              aria-pressed={on}
              className={`ccell blueprint flex flex-col gap-0.5 px-3 py-2.5 text-left ${
                on ? "border-primary bg-primary text-canvas" : "text-ink"
              }`}
            >
              <span className="font-heading text-[17px] uppercase leading-tight">
                {sub.title}
              </span>
              <Mono className={on ? "opacity-75" : "text-ink/45"}>
                {counts[sub.subcatSlug] ?? 0} itens
              </Mono>
            </button>
          );
        })}
      </div>
    </div>
  );
}
