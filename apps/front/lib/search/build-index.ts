import { NO_BRAND } from "./lexicon";
import { chunkWords, foldText, tokenize } from "./normalize";
import { singularCandidates } from "./singular";
import type { IndexedDoc, SearchDoc, SearchIndex } from "./types";

/**
 * Palavras de um campo: as partes, as formas juntas dos códigos e os
 * singulares — assim quem busca "botao" acha "Botões".
 */
function fieldWords(text: string): string[] {
  const words = new Set<string>();
  for (const chunk of tokenize(foldText(text))) {
    for (const word of chunkWords(chunk)) {
      words.add(word);
      for (const singular of singularCandidates(word)) words.add(singular);
    }
  }
  return [...words];
}

function leadWord(name: string): string | null {
  const [first] = tokenize(foldText(name));
  return first?.parts[0] ?? first?.joined ?? null;
}

function brandText(brand: string | null): string {
  return brand && foldText(brand) !== NO_BRAND ? brand : "";
}

function indexDoc(doc: SearchDoc): IndexedDoc {
  return {
    id: doc.id,
    fields: {
      name: fieldWords(doc.name),
      brand: fieldWords(brandText(doc.brand)),
      taxonomy: fieldWords(doc.taxonomy.join(" ")),
    },
    lead: leadWord(doc.name),
  };
}

/**
 * Índice da consulta: os produtos na ordem recebida (o desempate) e o
 * vocabulário com a frequência de cada palavra. `extraWords` entra no
 * vocabulário sem produto — são as palavras dos sinônimos, alvo possível de
 * uma correção de digitação.
 */
export function buildSearchIndex(docs: SearchDoc[], extraWords: Iterable<string> = []): SearchIndex {
  const indexed = docs.map(indexDoc);
  const vocabulary = new Map<string, number>();

  for (const doc of indexed) {
    const words = new Set([...doc.fields.name, ...doc.fields.brand, ...doc.fields.taxonomy]);
    for (const word of words) vocabulary.set(word, (vocabulary.get(word) ?? 0) + 1);
  }
  for (const word of extraWords) {
    if (!vocabulary.has(word)) vocabulary.set(word, 0);
  }

  return { docs: indexed, vocabulary };
}
