import { MAX_QUERY_LENGTH, STOPWORDS, UNIT_ALIASES } from "./lexicon";
import type { Chunk } from "./types";

const DIACRITICS = /[\u0300-\u036f]/g;
// Aspas de polegada: reta, duas simples, tipográfica e o sinal de polegada.
const INCHES = /(\d)\s*(?:"|''|\u201d|\u2033)/g;
const THOUSANDS = /(\d)\.(?=\d{3}(?!\d))/g;
const DECIMAL_COMMA = /(\d),(\d)/g;
// Montada das constantes, nunca do que o usuário digita. Unidades mais longas
// primeiro, para "mbps" não virar "mb" + "ps".
const UNITS = new RegExp(
  `(\\d)\\s*(${Object.keys(UNIT_ALIASES)
    .sort((a, b) => b.length - a.length)
    .join("|")})(?![a-z0-9])`,
  "g",
);
/** Ponto fora de um número é separador ("m.2"); entre dígitos é decimal ("1.5ton"). */
const LOOSE_DOT = /(?<!\d)\.|\.(?!\d)/g;
const SEPARATORS = /[^a-z0-9.]+/;

/** Minúsculas, sem acento, com números e unidades num formato só. */
export function foldText(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(INCHES, "$1pol ")
    .replace(THOUSANDS, "$1")
    .replace(DECIMAL_COMMA, "$1.$2")
    .replace(UNITS, (_match, digit: string, unit: string) => digit + (UNIT_ALIASES[unit] ?? unit))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Um trecho entre espaços. "py9-00021" rende as partes ("py9", "00021") e a
 * forma junta ("py900021"); stopwords e letras soltas saem das partes, mas a
 * forma junta guarda tudo ("m.2" → "m2").
 */
function toChunk(raw: string): Chunk | null {
  const parts = raw.replace(LOOSE_DOT, " ").split(SEPARATORS).filter(Boolean);
  const joined = parts.length > 1 ? parts.join("") : null;
  const kept = parts.filter((part) => part.length > 1 && !STOPWORDS.has(part));
  if (kept.length === 0 && !joined) return null;
  return { parts: kept, joined };
}

/** Quebra um texto já dobrado por `foldText` em trechos. */
export function tokenize(folded: string): Chunk[] {
  return folded
    .split(" ")
    .map(toChunk)
    .filter((chunk): chunk is Chunk => chunk !== null);
}

/** Todas as palavras de um trecho: as partes e, se houver, a forma junta. */
export function chunkWords(chunk: Chunk): string[] {
  return chunk.joined ? [...chunk.parts, chunk.joined] : chunk.parts;
}

/** O termo como a busca o entende — também serve de chave de cache. */
export function canonicalSearch(raw: string): string {
  return foldText(raw.slice(0, MAX_QUERY_LENGTH));
}

/** Falso para o que não sobra nada depois da limpeza ("   ", "de da"). */
export function hasSearchTerms(raw: string): boolean {
  return tokenize(canonicalSearch(raw)).length > 0;
}
