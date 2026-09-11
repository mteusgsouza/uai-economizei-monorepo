import { unstable_cache } from "next/cache";
import type { Payload, Where } from "payload";
import { rankProducts } from "@/lib/search/rank";
import type { RankMode } from "@/lib/search/types";
import { AVAILABLE } from "./filters";
import { mapProduct } from "./map-product";
import { getPayloadClient } from "./payload-client";
import { buildSort, buildWhere, type ProductQuery } from "./product-query";
import { toListResult, type ProductListResult } from "./products";
import { loadSearchDocs, loadSynonymRows } from "./search-data";

/** O que a tela precisa saber da busca além dos produtos. */
export interface SearchSummary {
  mode: RankMode;
  /** O termo depois das correções de digitação, quando houve alguma. */
  correctedTerm: string | null;
}

export interface SearchListResult extends ProductListResult {
  search: SearchSummary;
}

const EMPTY_PAGE: ProductListResult = { docs: [], totalDocs: 0, totalPages: 0, page: 1 };

function onlyIds(ids: number[]): Where {
  return { and: [...AVAILABLE, { id: { in: ids } }] };
}

/**
 * Uma página dos produtos ranqueados. Com uma ordenação escolhida, a busca só
 * filtra e o banco ordena; em "Relevância", a ordem é a do ranking.
 */
async function fetchRankedPage(
  payload: Payload,
  ids: number[],
  query: ProductQuery,
): Promise<ProductListResult> {
  if (ids.length === 0) return EMPTY_PAGE;
  const limit = query.limit ?? 24;

  if (query.sortBy) {
    const result = await payload.find({
      collection: "products",
      where: onlyIds(ids),
      sort: buildSort(query),
      page: query.page ?? 1,
      limit,
      depth: 1,
    });
    return toListResult(result);
  }

  const totalPages = Math.ceil(ids.length / limit);
  const page = Math.min(Math.max(query.page ?? 1, 1), totalPages);
  const pageIds = ids.slice((page - 1) * limit, page * limit);
  const result = await payload.find({
    collection: "products",
    where: onlyIds(pageIds),
    pagination: false,
    depth: 1,
  });

  const byId = new Map(result.docs.map((doc) => [doc.id, doc]));
  const docs = pageIds.flatMap((id) => {
    const doc = byId.get(id);
    return doc ? [mapProduct(doc)] : [];
  });
  return { docs, totalDocs: ids.length, totalPages, page };
}

async function fetchSearchResults(query: ProductQuery, term: string): Promise<SearchListResult> {
  const payload = await getPayloadClient();
  const [docs, synonymRows] = await Promise.all([
    loadSearchDocs(payload, buildWhere(query)),
    loadSynonymRows(payload),
  ]);

  const ranking = rankProducts(docs, synonymRows, term);
  const page = await fetchRankedPage(payload, ranking.ids, query);
  return { ...page, search: { mode: ranking.mode, correctedTerm: ranking.correctedTerm } };
}

/**
 * Busca tolerante com os filtros da vitrine. O índice é montado dentro da
 * consulta (e não cacheado à parte) porque o Next ignora um `unstable_cache`
 * dentro de outro. Cacheada pelo termo canônico + filtros + página.
 */
export const getSearchResults = unstable_cache(
  (query: ProductQuery, term: string) => fetchSearchResults(query, term),
  ["catalog-search"],
  { tags: ["products", "brands", "categories", "search-synonyms"], revalidate: 300 },
);
