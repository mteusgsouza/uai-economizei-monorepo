import { buildSearchIndex } from "./build-index";
import { canonicalSearch } from "./normalize";
import { parseQuery } from "./parse-query";
import { scoreDoc, type DocScore } from "./score";
import { parseSynonymGroups } from "./synonyms";
import type { Ranking, SearchDoc } from "./types";

interface Scored extends DocScore {
  id: number;
  /** Posição na lista recebida — a ordem da vitrine desempata. */
  order: number;
}

const EMPTY: Ranking = { ids: [], mode: "all", corrections: [], correctedTerm: null };

/** Sem produto com todos os termos: ficam só os que têm mais termos. */
function bestPartial(scored: Scored[]): Scored[] {
  const top = scored.reduce((max, item) => Math.max(max, item.matched), 0);
  return top === 0 ? [] : scored.filter((item) => item.matched === top);
}

function compare(a: Scored, b: Scored): number {
  return (
    Number(b.firstMatched) - Number(a.firstMatched) || b.score - a.score || a.order - b.order
  );
}

/**
 * Ordena os produtos por relevância para o termo. `docs` chega na ordem da
 * vitrine (mais novos primeiro), que vale como desempate. Sem nenhum produto
 * com todos os termos, cai para os que têm mais deles (modo "any").
 */
export function rankProducts(docs: SearchDoc[], synonymRows: string[], term: string): Ranking {
  const groups = parseSynonymGroups(synonymRows);
  const index = buildSearchIndex(docs, groups.flat(2));
  const { concepts, corrections } = parseQuery(canonicalSearch(term), index.vocabulary, groups);
  if (concepts.length === 0) return EMPTY;

  const scored = index.docs.map((doc, order) => ({ id: doc.id, order, ...scoreDoc(concepts, doc) }));
  const complete = scored.filter((item) => item.matched === concepts.length);
  const mode = complete.length > 0 ? "all" : "any";
  const pool = (mode === "all" ? complete : bestPartial(scored)).sort(compare);
  if (pool.length === 0) return EMPTY;

  return {
    ids: pool.map((item) => item.id),
    mode,
    corrections,
    correctedTerm: corrections.length > 0 ? concepts.map((concept) => concept.label).join(" ") : null,
  };
}
