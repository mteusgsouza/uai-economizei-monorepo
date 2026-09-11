import { BONUS, FIELD_WEIGHTS } from "./lexicon";
import { wordScore } from "./token-matches";
import type { Alternative, Concept, IndexedDoc, SearchField } from "./types";

const ALL_FIELDS: readonly SearchField[] = ["name", "brand", "taxonomy"];
const NAME_ONLY: readonly SearchField[] = ["name"];

export interface DocScore {
  /** Quantos termos da consulta o produto tem. */
  matched: number;
  /** O primeiro termo — em geral o tipo do produto — casou. */
  firstMatched: boolean;
  score: number;
}

function bestWordScore(query: string, words: readonly string[]): number {
  let best = 0;
  for (const word of words) {
    best = Math.max(best, wordScore(query, word));
    if (best === 1) break;
  }
  return best;
}

/** Todas as palavras da alternativa precisam aparecer; a pior delas dá a nota. */
function alternativeScore(
  alternative: Alternative,
  doc: IndexedDoc,
  fields: readonly SearchField[],
): number {
  let worst = Number.POSITIVE_INFINITY;
  for (const query of alternative.words) {
    let best = 0;
    for (const field of fields) {
      best = Math.max(best, bestWordScore(query, doc.fields[field]) * FIELD_WEIGHTS[field]);
    }
    if (best === 0) return 0;
    worst = Math.min(worst, best);
  }
  return Number.isFinite(worst) ? worst * alternative.weight : 0;
}

/** Nota de um termo no produto: a melhor entre as alternativas (0 = não casa). */
export function conceptScore(
  concept: Concept,
  doc: IndexedDoc,
  fields: readonly SearchField[] = ALL_FIELDS,
): number {
  let best = 0;
  for (const alternative of concept.alternatives) {
    best = Math.max(best, alternativeScore(alternative, doc, fields));
  }
  return best;
}

/** O nome começa pelo primeiro termo? ("Mouse Óptico…" antes de "Kit … Mouse"). */
function startsWithConcept(concept: Concept, doc: IndexedDoc): boolean {
  if (!doc.lead) return false;
  const leadOnly: IndexedDoc = { ...doc, fields: { name: [doc.lead], brand: [], taxonomy: [] } };
  return conceptScore(concept, leadOnly, NAME_ONLY) > 0;
}

export function scoreDoc(concepts: Concept[], doc: IndexedDoc): DocScore {
  const scores = concepts.map((concept) => conceptScore(concept, doc));
  const matched = scores.filter((score) => score > 0).length;
  let score = scores.reduce((sum, value) => sum + value, 0);

  const [first] = concepts;
  if (first && startsWithConcept(first, doc)) score += BONUS.lead;
  if (matched === concepts.length && concepts.every((c) => conceptScore(c, doc, NAME_ONLY) > 0)) {
    score += BONUS.allInName;
  }

  return { matched, firstMatched: (scores[0] ?? 0) > 0, score };
}
