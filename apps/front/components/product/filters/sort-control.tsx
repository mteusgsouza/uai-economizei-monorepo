"use client";

import { Segmented } from "@/components/ui/segmented";
import { Mono } from "@/components/ui/mono";
import { useFilterParams } from "./use-filter-params";

const OPTIONS = [
  { value: "relevancia", label: "Relevância" },
  { value: "preco", label: "Menor preço" },
  { value: "desconto", label: "Maior desconto" },
] as const;

type SortValue = (typeof OPTIONS)[number]["value"];

/** Mapeia a escolha para os parâmetros que `getProducts` entende. */
const PARAMS: Record<SortValue, { sortBy: string | null; sortOrder: string | null }> = {
  relevancia: { sortBy: null, sortOrder: null },
  preco: { sortBy: "value", sortOrder: "asc" },
  desconto: { sortBy: "discount", sortOrder: "desc" },
};

export function SortControl({ className }: { className?: string }) {
  const { get, setMany } = useFilterParams();

  const sortBy = get("sortBy");
  const current: SortValue =
    sortBy === "value" ? "preco" : sortBy === "discount" ? "desconto" : "relevancia";

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <Mono className="hidden text-ink/50 sm:inline">Ordenar</Mono>
        <Segmented
          aria-label="Ordenar produtos"
          options={[...OPTIONS]}
          value={current}
          onChange={(value) => setMany(PARAMS[value])}
        />
      </div>
    </div>
  );
}
