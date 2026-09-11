import { ALTERNATIVE_WEIGHTS, MAX_CHUNKS, MAX_CONCEPTS } from "./lexicon";
import { tokenize } from "./normalize";
import { singularCandidates } from "./singular";
import { findPhrases, type PhraseHit } from "./synonyms";
import { hasVocabularyHit, typoCandidates, type TypoCandidate } from "./token-matches";
import type {
  Alternative,
  Chunk,
  Concept,
  Correction,
  ParsedQuery,
  SynonymGroup,
  Vocabulary,
} from "./types";

/** Uma palavra digitada e as outras formas pelas quais ela pode casar. */
interface QueryWord {
  word: string;
  singulars: string[];
  typos: TypoCandidate[];
}

function describeWord(word: string, vocabulary: Vocabulary): QueryWord {
  const singulars = singularCandidates(word).filter((form) => vocabulary.has(form));
  // Só procura correção quando a palavra, do jeito que veio, não acha nada.
  const known = singulars.length > 0 || hasVocabularyHit(word, vocabulary);
  return { word, singulars, typos: known ? [] : typoCandidates(word, vocabulary) };
}

function typoWeight(distance: number): number {
  return distance <= 1 ? ALTERNATIVE_WEIGHTS.typo1 : ALTERNATIVE_WEIGHTS.typo2;
}

/** Peso da forma usada para chegar em `form` a partir do que foi digitado. */
function formWeight(item: QueryWord, form: string): number {
  if (form === item.word) return ALTERNATIVE_WEIGHTS.original;
  if (item.singulars.includes(form)) return ALTERNATIVE_WEIGHTS.singular;
  const typo = item.typos.find((candidate) => candidate.word === form);
  return typo ? typoWeight(typo.distance) : 0;
}

function wordConcept(item: QueryWord): Concept {
  return {
    label: item.typos[0]?.word ?? item.word,
    alternatives: [
      { words: [item.word], weight: ALTERNATIVE_WEIGHTS.original },
      ...item.singulars.map((form) => ({ words: [form], weight: ALTERNATIVE_WEIGHTS.singular })),
      ...item.typos.map((typo) => ({ words: [typo.word], weight: typoWeight(typo.distance) })),
    ],
  };
}

/** Trecho com pontuação no meio ("py9-00021"): casa junto ou em partes. */
function chunkConcept(chunk: Chunk): Concept {
  const alternatives: Alternative[] = [];
  if (chunk.joined) alternatives.push({ words: [chunk.joined], weight: ALTERNATIVE_WEIGHTS.original });
  if (chunk.parts.length > 0) alternatives.push({ words: chunk.parts, weight: ALTERNATIVE_WEIGHTS.original });
  return { label: chunk.parts.join(" ") || (chunk.joined ?? ""), alternatives };
}

/** Termo de sinônimo: o que foi digitado vale cheio, os equivalentes um pouco menos. */
function phraseConcept(hit: PhraseHit, items: QueryWord[], corrections: Correction[]): Concept {
  let weight: number = ALTERNATIVE_WEIGHTS.original;
  hit.matched.forEach((form, offset) => {
    const item = items[hit.start + offset];
    if (!item) return;
    weight = Math.min(weight, formWeight(item, form));
    if (item.typos.some((typo) => typo.word === form)) corrections.push({ from: item.word, to: form });
  });

  const typed = hit.matched.join(" ");
  return {
    label: typed,
    alternatives: hit.sequences.map((words) => ({
      words,
      weight: words.join(" ") === typed ? weight : weight * ALTERNATIVE_WEIGHTS.synonym,
    })),
  };
}

/**
 * Transforma o termo canônico em conceitos: sinônimos cadastrados primeiro
 * (a frase mais longa vence), depois trechos com pontuação, depois palavras
 * soltas com singular e correção.
 */
export function parseQuery(canonical: string, vocabulary: Vocabulary, groups: SynonymGroup[]): ParsedQuery {
  const chunks = tokenize(canonical).slice(0, MAX_CHUNKS);
  const items = chunks.flatMap((chunk) => chunk.parts.map((word) => describeWord(word, vocabulary)));
  const forms = items.map((item) => [item.word, ...item.singulars, ...item.typos.map((typo) => typo.word)]);

  const hitsByStart = new Map<number, PhraseHit>();
  const covered = new Set<number>();
  for (const hit of findPhrases(forms, groups)) {
    hitsByStart.set(hit.start, hit);
    for (let offset = 0; offset < hit.length; offset++) covered.add(hit.start + offset);
  }

  const concepts: Concept[] = [];
  const corrections: Correction[] = [];
  let position = 0;

  for (const chunk of chunks) {
    const positions = chunk.parts.map((_, offset) => position + offset);
    position += chunk.parts.length;

    if (chunk.parts.length === 0 || (chunk.joined && positions.every((p) => !covered.has(p)))) {
      concepts.push(chunkConcept(chunk));
      continue;
    }

    for (const p of positions) {
      const hit = hitsByStart.get(p);
      const item = items[p];
      if (hit) concepts.push(phraseConcept(hit, items, corrections));
      if (hit || covered.has(p) || !item) continue;
      concepts.push(wordConcept(item));
      const [typo] = item.typos;
      if (typo) corrections.push({ from: item.word, to: typo.word });
    }
  }

  return { concepts: concepts.slice(0, MAX_CONCEPTS), corrections };
}
