"use client";

import usePageParams from "@/hooks/usePageParams";
import type { Brand, CategoryWithSubcategories } from "@/types/product";
import { FilterCheckboxGroup } from "./filter-checkbox-group";
import { FilterChips } from "./filter-chips";
import { PriceFilter } from "./price-filter";

interface FiltersPanelProps {
  categories: CategoryWithSubcategories[];
  brands: Brand[];
}

/** Painel completo de filtros da página /produtos (sidebar e sheet mobile). */
export function FiltersPanel({ categories, brands }: FiltersPanelProps) {
  const { searchParams, router } = usePageParams();

  const categoria = searchParams.get("categoria") ?? undefined;
  const subcategoria = searchParams.get("subcategoria") ?? undefined;
  const marca = searchParams.get("marca") ?? undefined;
  const precoMin = searchParams.get("precoMin");
  const precoMax = searchParams.get("precoMax");

  const activeCategory = categories.find((c) => c.categorySlug === categoria);
  const activeSubcategories = activeCategory?.subcategories ?? [];
  const hasActiveFilters = !!(categoria || subcategoria || marca || precoMin || precoMax);

  return (
    <div className="space-y-6">
      <FilterChips categories={categories} />

      <FilterCheckboxGroup
        title="Categorias"
        paramLabel="categoria"
        idPrefix="cat"
        activeKey={categoria}
        options={categories.map((cat) => ({ key: cat.categorySlug, label: cat.title }))}
      />

      <FilterCheckboxGroup
        title="Subcategorias"
        paramLabel="subcategoria"
        idPrefix="subcat"
        activeKey={subcategoria}
        options={activeSubcategories.map((sub) => ({
          key: sub.subcatSlug,
          label: sub.title,
        }))}
      />

      <FilterCheckboxGroup
        title="Marcas"
        paramLabel="marca"
        idPrefix="brand"
        activeKey={marca}
        options={brands.map((brand) => ({ key: brand.name, label: brand.name }))}
      />

      <PriceFilter />

      {hasActiveFilters && (
        <button
          onClick={() => router.push("/produtos", { scroll: false })}
          className="text-sm text-steel underline underline-offset-2 transition-colors hover:text-ink"
        >
          Limpar todos os filtros
        </button>
      )}
    </div>
  );
}
