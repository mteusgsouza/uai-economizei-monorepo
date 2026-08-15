"use client";

import { useState } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Sheet, SheetContent, SheetTitle } from "@workspace/ui/components/sheet";
import type { Brand, CategoryWithSubcategories } from "@/types/product";
import { FiltersPanel } from "./filters-panel";
import { SortControl } from "./sort-control";
import { useFilterParams } from "./use-filter-params";

interface ProductsToolbarProps {
  categories: CategoryWithSubcategories[];
  brands: Brand[];
  categoryCounts: Record<string, number>;
  subcategoryCounts?: Record<string, number>;
}

/**
 * A barra do mobile: filtros e ordenação viram gavetas, porque a coluna
 * lateral não cabe em 390px. No desktop a coluna já está na página e esta
 * barra some.
 */
export function ProductsToolbar({
  categories,
  brands,
  categoryCounts,
  subcategoryCounts,
}: ProductsToolbarProps) {
  const { activeCount } = useFilterParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="flex gap-2 lg:hidden">
      <Button
        variant="outline"
        className="flex-1 gap-2"
        onClick={() => setFiltersOpen(true)}
      >
        <SlidersHorizontal className="size-4" />
        Filtros{activeCount > 0 ? ` · ${activeCount}` : ""}
      </Button>
      <Button variant="outline" className="flex-1 gap-2" onClick={() => setSortOpen(true)}>
        <ArrowUpDown className="size-4" />
        Ordenar
      </Button>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-[330px]! max-w-full flex-col gap-0 border-r border-divider bg-canvas p-0"
        >
          <div className="border-b border-divider px-4 py-3">
            <SheetTitle className="font-heading text-xl uppercase">Filtros</SheetTitle>
          </div>
          <div className="flex-1 overflow-auto px-4 pb-4">
            <FiltersPanel
              categories={categories}
              brands={brands}
              categoryCounts={categoryCounts}
              subcategoryCounts={subcategoryCounts}
              onApply={() => setFiltersOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="gap-0 border-t border-divider bg-canvas p-0"
        >
          <div className="border-b border-divider px-4 py-3">
            <SheetTitle className="font-heading text-xl uppercase">Ordenar</SheetTitle>
          </div>
          <div className="p-4" onClick={() => setSortOpen(false)}>
            <SortControl />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
