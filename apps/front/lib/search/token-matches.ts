import { boundedDistance, typoBudget } from "./distance";
import { MATCH_WEIGHTS, MAX_TYPO_CANDIDATES } from "./lexicon";
import type { Vocabulary } from "./types";

const NUMERIC = /^\d+(\.\d+)?$/;
const MEASURE = /^\d+(\.\d+)?[a-z]+$/;
const HAS_DIGIT = /\d/;
const HAS_LETTER = /[a-z]/;
const LETTERS_ONLY = /^[a-z]+$/;

/** Código de modelo: letras e dígitos misturados, sem ser número + unidade. */
function isCode(word: string): boolean {
  return HAS_DIGIT.test(word) && HAS_LETTER.test(word) && !MEASURE.test(word);
}

/**
 * Número só casa como prefixo se o que vem depois é unidade: "240" acha
 * "240gb", não "2400mah". Palavra precisa de 3 letras — "tv" só casa inteira.
 */
function allowsPrefix(query: string, word: string): boolean {
  if (NUMERIC.test(query)) return HAS_LETTER.test(word.charAt(query.length));
  return query.length >= 3;
}

/**
 * Quanto uma palavra da consulta casa com uma palavra do produto (0 = não
 * casa). Pedaço no meio da palavra só vale para código: "rede" não acha
 * "parede", mas "28e590" acha "lu28e590dszd".
 */
export function wordScore(query: string, word: string): number {
  if (query === word) return MATCH_WEIGHTS.exact;
  if (word.length > query.length && word.startsWith(query) && allowsPrefix(query, word)) {
    return MATCH_WEIGHTS.prefix;
  }
  if (query.length >= 4 && isCode(query) && word.includes(query)) return MATCH_WEIGHTS.infix;
  return 0;
}

/** A palavra já acha algo do jeito que foi digitada? */
export function hasVocabularyHit(query: string, vocabulary: Vocabulary): boolean {
  if (vocabulary.has(query)) return true;
  for (const word of vocabulary.keys()) {
    if (wordScore(query, word) > 0) return true;
  }
  return false;
}

export interface TypoCandidate {
  word: string;
  distance: number;
}

interface RankedCandidate extends TypoCandidate {
  /** Casou só com o começo da palavra ("logitek" → "logitec…h"). */
  prefix: boolean;
  frequency: number;
}

/** Menor distância entre a consulta e um começo da palavra, dentro do orçamento. */
function prefixDistance(query: string, word: string, budget: number): number {
  let best = budget + 1;
  for (let length = query.length - budget; length <= query.length + budget; length++) {
    if (length < 1 || length >= word.length) continue;
    best = Math.min(best, boundedDistance(query, word.slice(0, length), budget));
  }
  return best;
}

function compareCandidates(a: RankedCandidate, b: RankedCandidate): number {
  return (
    a.distance - b.distance ||
    Number(a.prefix) - Number(b.prefix) ||
    b.frequency - a.frequency ||
    a.word.localeCompare(b.word)
  );
}

/**
 * Palavras do vocabulário a que um erro de digitação pode ter querido chegar.
 * Só palavras de letras: código e medida não se corrigem.
 */
export function typoCandidates(query: string, vocabulary: Vocabulary): TypoCandidate[] {
  const budget = typoBudget(query);
  if (budget === 0) return [];

  const found: RankedCandidate[] = [];
  for (const [word, frequency] of vocabulary) {
    if (!LETTERS_ONLY.test(word)) continue;
    const full = boundedDistance(query, word, budget);
    const distance = full <= budget ? full : prefixDistance(query, word, budget);
    if (distance <= budget) found.push({ word, distance, prefix: full > budget, frequency });
  }

  return found
    .sort(compareCandidates)
    .slice(0, MAX_TYPO_CANDIDATES)
    .map(({ word, distance }) => ({ word, distance }));
}
