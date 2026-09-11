import { canonicalSearch, hasSearchTerms } from "@/lib/search/normalize";
import type { ProductQuery } from "./product-query";
import { getProducts, type ProductListResult } from "./products";
import { getSearchResults, type SearchSummary } from "./search-results";

export interface ListingQuery extends ProductQuery {
  /** O termo como veio da URL. */
  search?: string;
}

export interface ListingResult extends ProductListResult {
  /** Só existe quando houve busca de fato. */
  search?: SearchSummary;
}

/**
 * A listagem de /produtos: com termo, pela busca tolerante; sem termo — ou
 * com um que não sobra nada depois da limpeza, como "   " —, pela vitrine.
 */
export async function loadListing({ search, ...query }: ListingQuery): Promise<ListingResult> {
  if (!search || !hasSearchTerms(search)) return getProducts(query);
  return getSearchResults(query, canonicalSearch(search));
}
