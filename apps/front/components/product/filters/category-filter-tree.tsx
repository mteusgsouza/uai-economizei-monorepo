"use client"

import { ChevronDown } from "lucide-react"
import type { CategoryWithSubcategories } from "@/types/product"
import { Mono } from "@/components/ui/mono"
import { FilterCheckbox } from "./filter-checkbox"

interface CategoryFilterTreeProps {
  categories: CategoryWithSubcategories[]
  /** Slug da categoria selecionada — é ela que fica aberta. */
  selectedCategory: string | null | undefined
  selectedSubcategories: string[]
  /** Produtos ativos por `categorySlug`. */
  categoryCounts: Record<string, number>
  /** Produtos ativos por `subcatSlug`; as zeradas não viram filtro. */
  subcategoryCounts?: Record<string, number>
  onSelectCategory: (categorySlug: string) => void
  onSelectSubcategory: (category: CategoryWithSubcategories, subSlug: string) => void
}

/**
 * A árvore de categorias do painel de filtros. A categoria é o filtro em si —
 * o nível de cima — e as subcategorias dela ficam recuadas embaixo.
 */
export function CategoryFilterTree({
  categories,
  selectedCategory,
  selectedSubcategories,
  categoryCounts,
  subcategoryCounts,
  onSelectCategory,
  onSelectSubcategory,
}: CategoryFilterTreeProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {categories.map((category) => {
        const open = category.categorySlug === selectedCategory

        // Subcategoria sem produto não vira filtro: só levaria a uma lista
        // vazia. Volta sozinha quando houver estoque.
        const visibleSubcategories = category.subcategories.filter(
          (sub) => (subcategoryCounts?.[sub.subcatSlug] ?? 0) > 0 || selectedSubcategories.includes(sub.subcatSlug)
        )

        return (
          <details key={category.id} className="acc" open={open}>
            {/* Clicar na categoria seleciona/deseleciona e abre/fecha junto. O
                toggle nativo do <summary> é bloqueado porque quem manda no
                "open" é o estado da URL, não o DOM. */}
            <summary
              className={`flex cursor-pointer items-center gap-2 text-sm ${open ? "text-accent-700" : ""}`}
              onClick={(e) => {
                e.preventDefault()
                onSelectCategory(category.categorySlug)
              }}
            >
              <ChevronDown className="chev size-3.5 flex-none" />
              <span className="min-w-0 flex-1 truncate">{category.title}</span>
              <Mono className="text-ink/45">{categoryCounts[category.categorySlug] ?? 0}</Mono>
            </summary>

            {visibleSubcategories.length > 0 && (
              <div className="mt-2.5 ml-3 flex flex-col gap-[7px] border-l border-divider pl-3">
                {visibleSubcategories.map((sub) => (
                  <FilterCheckbox
                    key={sub.subcatSlug}
                    label={sub.title}
                    checked={open && selectedSubcategories.includes(sub.subcatSlug)}
                    onChange={() => onSelectSubcategory(category, sub.subcatSlug)}
                    count={subcategoryCounts?.[sub.subcatSlug]}
                  />
                ))}
              </div>
            )}
          </details>
        )
      })}
    </div>
  )
}
