import { foldText, tokenize } from "./normalize";
import type { SynonymGroup } from "./types";

const TERM_SEPARATORS = /[,;\n]+/;

/** Onde um grupo de sinônimos apareceu na consulta. */
export interface PhraseHit {
  /** Posição da primeira palavra e quantas palavras o termo ocupa. */
  start: number;
  length: number;
  /** As palavras que casaram, na forma do termo cadastrado. */
  matched: string[];
  /** Todos os termos equivalentes (de todos os grupos que casaram). */
  sequences: string[][];
}

function uniqueSequences(sequences: string[][]): string[][] {
  const seen = new Map<string, string[]>();
  for (const sequence of sequences) seen.set(sequence.join(" "), sequence);
  return [...seen.values()];
}

/**
 * Termos de um cadastro, na grafia do lojista, sem vazios nem repetidos.
 * Aceita vírgula, ponto e vírgula ou quebra de linha. Termo que só tem
 * stopword ("de") não conta.
 */
export function splitTerms(raw: string): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const piece of raw.split(TERM_SEPARATORS)) {
    const term = piece.trim();
    const key = foldText(term);
    if (!key || seen.has(key) || tokenize(key).length === 0) continue;
    seen.add(key);
    terms.push(term);
  }
  return terms;
}

/** Um termo vira sequência de palavras: em partes e, se tinha hífen, junto. */
function termSequences(term: string): string[][] {
  const chunks = tokenize(foldText(term));
  const split = chunks.flatMap((chunk) => chunk.parts);
  const joined = chunks.flatMap((chunk) => (chunk.joined ? [chunk.joined] : chunk.parts));
  return uniqueSequences([split, joined].filter((sequence) => sequence.length > 0));
}

/** Grupos prontos para a busca; cadastro com menos de dois termos úteis é ignorado. */
export function parseSynonymGroups(rows: string[]): SynonymGroup[] {
  const groups: SynonymGroup[] = [];
  for (const row of rows) {
    const sequences = uniqueSequences(splitTerms(row).flatMap(termSequences));
    if (sequences.length >= 2) groups.push(sequences);
  }
  return groups;
}

function matchesAt(forms: string[][], start: number, sequence: string[]): boolean {
  return sequence.every((word, offset) => forms[start + offset]?.includes(word) ?? false);
}

/** O termo mais longo que começa em `start`; empate entre grupos soma os grupos. */
function longestAt(forms: string[][], start: number, groups: SynonymGroup[]): PhraseHit | null {
  let best: PhraseHit | null = null;
  for (const group of groups) {
    for (const sequence of group) {
      if (sequence.length === 0 || !matchesAt(forms, start, sequence)) continue;
      if (best === null || sequence.length > best.length) {
        best = { start, length: sequence.length, matched: sequence, sequences: group };
      } else if (sequence.length === best.length) {
        best.sequences = uniqueSequences([...best.sequences, ...group]);
      }
    }
  }
  return best;
}

/**
 * Acha os termos cadastrados na consulta, da esquerda para a direita, sempre
 * o mais longo ("fone de ouvido" antes de "fone"). `forms[i]` são as formas
 * aceitas da palavra i: a digitada, singulares e correções.
 */
export function findPhrases(forms: string[][], groups: SynonymGroup[]): PhraseHit[] {
  const hits: PhraseHit[] = [];
  let start = 0;
  while (start < forms.length) {
    const hit = longestAt(forms, start, groups);
    if (hit) hits.push(hit);
    start += hit ? hit.length : 1;
  }
  return hits;
}
