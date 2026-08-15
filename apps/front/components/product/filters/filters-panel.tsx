"use client"

import { Button } from "@workspace/ui/components/button"
import type { Brand, CategoryWithSubcategories } from "@/types/product"
import { Mono } from "@/components/ui/mono"
import { Tag } from "@/components/ui/tag"
import { CategoryFilterTree } from "./category-filter-tree"
import { FilterCheckbox } from "./filter-checkbox"
import { PriceFilter } from "./price-filter"
import { useFilterParams } from "./use-filter-params"

interface FiltersPanelProps {
  categories: CategoryWithSubcategories[]
  brands: Brand[]
  /** Produtos ativos por `categorySlug`, para a contagem ao lado do nome. */
  categoryCounts: Record<string, number>
  /** Contagem por subcategoria da categoria aberta — as vazias não entram. */
  subcategoryCounts?: Record<string, number>
  /** Fecha a gaveta no mobile depois de aplicar. */
  onApply?: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-divider py-4">
      <div className="mb-2.5 font-heading text-[17px] uppercase">{title}</div>
      {children}
    </div>
  )
}

/**
 * A coluna de filtros: categorias em accordion com as subcategorias dentro,
 * faixa de preço, marcas como etiquetas e as condições de pagamento.
 *
 * Tudo escreve na URL — não há "estado pendente" esperando o botão. O
 * "Aplicar filtros" existe para fechar a gaveta no mobile.
 */
export function FiltersPanel({ categories, brands, categoryCounts, subcategoryCounts, onApply }: FiltersPanelProps) {
  const { get, getList, toggle, setMany, clear, activeCount } = useFilterParams()

  const categoria = get("categoria")
  const subcategorias = getList("subcategoria")
  const marca = get("marca")

  /**
   * Trocar de categoria zera as subcategorias: as da categoria anterior não
   * existem na nova, e o par misto devolvia lista vazia.
   */
  function selectCategory(slug: string) {
    if (categoria === slug) setMany({ categoria: null, subcategoria: null })
    else setMany({ categoria: slug, subcategoria: null })
  }

  /**
   * Escolher uma subcategoria arrasta a categoria dona junto. Se vier de outra
   * categoria, a seleção recomeça — senão sobrava filtro impossível.
   *
   * Dentro da mesma categoria a lista é reconstruída só com slugs dela: assim
   * uma subcategoria órfã herdada da URL não fica se acumulando.
   */
  function selectSubcategory(category: CategoryWithSubcategories, subSlug: string) {
    if (categoria !== category.categorySlug) {
      setMany({ categoria: category.categorySlug, subcategoria: subSlug })
      return
    }

    const validos = new Set(category.subcategories.map((s) => s.subcatSlug))
    const atuais = subcategorias.filter((slug) => validos.has(slug))
    const proximos = atuais.includes(subSlug) ? atuais.filter((slug) => slug !== subSlug) : [...atuais, subSlug]

    setMany({ subcategoria: proximos.length ? proximos.join(",") : null })
  }

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <Mono className="text-ink/50">Filtros</Mono>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clear}
            className="font-mono text-[10px] tracking-[0.14em] text-primary uppercase hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      <Section title="Categoria">
        <CategoryFilterTree
          categories={categories}
          selectedCategory={categoria}
          selectedSubcategories={subcategorias}
          categoryCounts={categoryCounts}
          subcategoryCounts={subcategoryCounts}
          onSelectCategory={selectCategory}
          onSelectSubcategory={selectSubcategory}
        />
      </Section>

      <Section title="Preço">
        <PriceFilter />
      </Section>

      {brands.length > 0 && (
        <Section title="Marca">
          <div className="flex flex-wrap gap-1.5">
            {brands.map((brand) => (
              <Tag
                as="button"
                type="button"
                key={brand.id}
                variant={marca === brand.name ? "solid" : "outline"}
                onClick={() => toggle("marca", brand.name)}
                className="cursor-pointer"
              >
                {brand.name}
              </Tag>
            ))}
          </div>
        </Section>
      )}

      <Section title="Pagamento">
        <div className="flex flex-col gap-2">
          <FilterCheckbox label="Desconto no PIX" checked={get("pix") === "1"} onChange={() => toggle("pix", "1")} />
          <FilterCheckbox
            label="Em promoção"
            checked={get("promocao") === "1"}
            onChange={() => toggle("promocao", "1")}
          />
        </div>
      </Section>

      {onApply && (
        <Button className="mt-2 w-full" onClick={onApply}>
          Aplicar filtros
        </Button>
      )}
    </div>
  )
}
