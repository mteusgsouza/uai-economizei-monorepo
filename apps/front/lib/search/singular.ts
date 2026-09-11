/** Terminações de plural do português e o que fica no singular. */
const RULES: readonly (readonly [suffix: string, singular: string])[] = [
  ["oes", "ao"],
  ["aes", "ao"],
  ["ais", "al"],
  ["eis", "el"],
  ["ois", "ol"],
  ["uis", "ul"],
  ["res", "r"],
  ["zes", "z"],
  ["ses", "s"],
  ["ns", "m"],
];

const LETTERS_ONLY = /^[a-z]+$/;

/**
 * Formas no singular de uma palavra no plural ("botoes" → "botao"). Pode
 * devolver forma que não existe ("mais" → "mal"): na consulta, quem chama
 * filtra pelo vocabulário; no índice, a forma extra só casa por igualdade.
 */
export function singularCandidates(word: string): string[] {
  if (word.length < 4 || !word.endsWith("s") || !LETTERS_ONLY.test(word)) return [];

  const candidates = new Set<string>();
  for (const [suffix, singular] of RULES) {
    if (word.endsWith(suffix)) candidates.add(word.slice(0, -suffix.length) + singular);
  }
  candidates.add(word.slice(0, -1));

  return [...candidates].filter((candidate) => candidate.length > 1 && candidate !== word);
}
