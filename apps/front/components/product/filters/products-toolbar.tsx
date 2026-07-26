"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import usePageParams from "@/hooks/usePageParams";
import type { Brand, CategoryWithSubcategories } from "@/types/product";
import { FiltersPanel } from "./filters-panel";

interface ProductsToolbarProps {
  categories: CategoryWithSubcategories[];
  brands: Brand[];
  totalDocs: number;
}

/** Barra superior de /produtos: filtros mobile, contagem e ordenação. */
export function ProductsToolbar({ categories, brands, totalDocs }: ProductsToolbarProps) {
  const { searchParams, router, pathname } = usePageParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const sortBy = searchParams.get("sortBy") ?? undefined;
  const sortOrder = searchParams.get("sortOrder") ?? undefined;
  const hasActiveFilters = ["categoria", "subcategoria", "marca", "precoMin", "precoMax"]
    .some((key) => searchParams.get(key));

  function updateSort(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "*") {
      params.delete("sortBy");
      params.delete("sortOrder");
    } else {
      const [sb, so] = val.split("-");
      params.set("sortBy", sb ?? "");
      params.set("sortOrder", so ?? "asc");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-on-dark">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto pt-12">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersPanel categories={categories} brands={brands} />
            </div>
          </SheetContent>
        </Sheet>

        <p className="text-sm text-steel">
          {totalDocs} {totalDocs === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </div>

      <Select
        value={sortBy ? `${sortBy}-${sortOrder ?? "asc"}` : "*"}
        onValueChange={updateSort}
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="*">Mais recentes</SelectItem>
          <SelectItem value="value-asc">Menor preco</SelectItem>
          <SelectItem value="value-desc">Maior preco</SelectItem>
          <SelectItem value="name-asc">Nome A-Z</SelectItem>
          <SelectItem value="name-desc">Nome Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
