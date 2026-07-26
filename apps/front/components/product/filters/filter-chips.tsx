"use client";

import { X } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import useHandleChangeQuery from "@/hooks/useHandleChangeQuery";
import usePageParams from "@/hooks/usePageParams";
import type { CategoryWithSubcategories } from "@/types/product";

function Chip({ label, onRemove, aria }: { label: string; onRemove: () => void; aria: string }) {
  return (
    <Badge variant="secondary" className="gap-1">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full hover:bg-steel/20"
        aria-label={aria}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

/** Chips dos filtros ativos, lidos da query string. */
export function FilterChips({ categories }: { categories: CategoryWithSubcategories[] }) {
  const { searchParams, router } = usePageParams();
  const handleChangeQuery = useHandleChangeQuery();

  const categoria = searchParams.get("categoria") ?? undefined;
  const subcategoria = searchParams.get("subcategoria") ?? undefined;
  const marca = searchParams.get("marca") ?? undefined;
  const precoMin = searchParams.get("precoMin");
  const precoMax = searchParams.get("precoMax");

  const activeCategory = categories.find((c) => c.categorySlug === categoria);
  const activeSubcategory = activeCategory?.subcategories.find(
    (s) => s.subcatSlug === subcategoria,
  );

  const hasActiveFilters = !!(categoria || subcategoria || marca || precoMin || precoMax);
  if (!hasActiveFilters) return null;

  function clearPriceFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("precoMin");
    params.delete("precoMax");
    params.delete("page");
    router.push(`/produtos?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {activeCategory && (
          <Chip
            label={activeCategory.title}
            onRemove={() => handleChangeQuery({ label: "categoria", value: "*" })}
            aria="Remover filtro de categoria"
          />
        )}
        {subcategoria && (
          <Chip
            label={activeSubcategory?.title ?? "Subcategoria"}
            onRemove={() => handleChangeQuery({ label: "subcategoria", value: "*" })}
            aria="Remover filtro de subcategoria"
          />
        )}
        {marca && (
          <Chip
            label={marca}
            onRemove={() => handleChangeQuery({ label: "marca", value: "*" })}
            aria="Remover filtro de marca"
          />
        )}
        {(precoMin || precoMax) && (
          <Chip
            label={`${precoMin ? `R$ ${Math.round(Number(precoMin) / 100)}` : "R$ 0"} - ${
              precoMax ? `R$ ${Math.round(Number(precoMax) / 100)}` : "..."
            }`}
            onRemove={clearPriceFilter}
            aria="Remover filtro de preco"
          />
        )}
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
