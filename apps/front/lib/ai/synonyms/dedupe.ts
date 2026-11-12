import { foldText } from "@/lib/search/normalize";
import { splitTerms } from "@/lib/search/synonyms";

export interface FilteredGroups {
  kept: string[][];
  skipped: string[][];
}

/** Termos já cadastrados, normalizados (sem acento, minúsculos). */
export function existingTermSet(rows: string[]): Set<string> {
  const set = new Set<string>();
  for (const row of rows) {
    for (const term of splitTerms(row)) set.add(foldText(term));
  }
  return set;
}

/**
 * Separa os grupos novos dos que não valem a pena: descarta o grupo se
 * QUALQUER termo já existe (cadastrado ou gerado antes na mesma rodada) e se
 * sobrar menos de dois termos válidos.
 */
export function filterNewGroups(groups: string[][], existing: Set<string>): FilteredGroups {
  const taken = new Set(existing);
  const kept: string[][] = [];
  const skipped: string[][] = [];

  for (const group of groups) {
    const terms = splitTerms(group.join(","));
    const keys = terms.map(foldText);
    if (terms.length < 2 || keys.some((key) => taken.has(key))) {
      skipped.push(group);
      continue;
    }
    for (const key of keys) taken.add(key);
    kept.push(terms);
  }

  return { kept, skipped };
}
