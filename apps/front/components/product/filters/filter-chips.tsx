"use client";

import { formatPrice } from "@workspace/ui/lib/format-price";
import type { CategoryWithSubcategories } from "@/types/product";
import { Tag } from "@/components/ui/tag";
import { useFilterParams } from "./use-filter-params";

/** Etiquetas do que está filtrado agora — clicar remove aquele filtro. */
export function FilterChips({ categories }: { categories: CategoryWithSubcategories[] }) {
  const { get, getList, set, setMany, toggleInList, searchParams } = useFilterParams();

  const categoria = get("categoria");
  const category = categories.find((c) => c.categorySlug === categoria);
  const subcategorias = getList("subcategoria");

  const price = (key: string) => {
    const raw = searchParams.get(key);
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) ? formatPrice(value) : null;
  };

  // A categoria só vira etiqueta quando está sozinha: com subcategorias
  // marcadas, elas já dizem onde se está.
  const chips: { key: string; label: string; remove: () => void }[] = [];

  if (category && subcategorias.length === 0) {
    chips.push({
      key: "categoria",
      label: category.title,
      // Sair da categoria leva junto o que dependia dela.
      remove: () => setMany({ categoria: null, subcategoria: null }),
    });
  }

  for (const slug of subcategorias) {
    const sub = category?.subcategories.find((s) => s.subcatSlug === slug);
    // Subcategoria que não é da categoria atual está sendo ignorada na busca;
    // anunciá-la como filtro ativo seria mentira.
    if (!sub) continue;
    chips.push({
      key: `sub-${slug}`,
      label: sub.title,
      remove: () => toggleInList("subcategoria", slug),
    });
  }

  const simple: [string, string | null][] = [
    ["marca", get("marca") ?? null],
    ["precoMin", price("precoMin") && `A partir de ${price("precoMin")}`],
    ["precoMax", price("precoMax") && `Até ${price("precoMax")}`],
    ["pix", get("pix") ? "Desconto no PIX" : null],
    ["promocao", get("promocao") ? "Em promoção" : null],
  ];

  for (const [key, label] of simple) {
    if (label) chips.push({ key, label, remove: () => set(key, null) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <Tag
          as="button"
          type="button"
          key={chip.key}
          onClick={chip.remove}
          className="cursor-pointer"
          aria-label={`Remover filtro ${chip.label}`}
        >
          {chip.label} ×
        </Tag>
      ))}
    </div>
  );
}
