// Só imports de tipo: este módulo também é usado por componentes de cliente.
import type { ListingQuery } from "./listing";

export const PAGE_SIZE = 24;

export type SearchParams = Record<string, string | string[] | undefined>;

/** Os filtros da listagem — o que "Limpar" apaga e conta. O termo buscado não entra. */
export const FILTER_KEYS = [
  "categoria",
  "subcategoria",
  "marca",
  "precoMin",
  "precoMax",
  "pix",
  "promocao",
] as const;

const SORTS = ["name", "value", "stock", "discount"] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildListingQuery(params: SearchParams): ListingQuery {
  const sortBy = first(params.sortBy);
  const sortOrder = first(params.sortOrder);
  return {
    page: toNumber(first(params.page)) ?? 1,
    limit: PAGE_SIZE,
    categorySlug: first(params.categoria),
    brandName: first(params.marca),
    subcategorySlugs: first(params.subcategoria)?.split(",").filter(Boolean),
    precoMin: toNumber(first(params.precoMin)),
    precoMax: toNumber(first(params.precoMax)),
    pixDiscount: first(params.pix) === "1",
    onSale: first(params.promocao) === "1",
    search: first(params.search),
    sortBy: SORTS.find((value) => value === sortBy),
    sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
  };
}

/** Os parâmetros com um valor só, para a paginação repetir na URL. */
export function flattenParams(params: SearchParams): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const single = first(value);
    if (single) flat[key] = single;
  }
  return flat;
}

export function hasActiveFilters(params: SearchParams): boolean {
  return FILTER_KEYS.some((key) => Boolean(first(params[key])));
}
