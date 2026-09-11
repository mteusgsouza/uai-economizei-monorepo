/** O texto de um produto que a busca enxerga, já resolvido das relações. */
export interface SearchDoc {
  id: number;
  name: string;
  brand: string | null;
  /** Categoria e subcategoria, nessa ordem. */
  taxonomy: string[];
}

export type SearchField = "name" | "brand" | "taxonomy";

/** Produto pronto para casar: palavras normalizadas de cada campo. */
export interface IndexedDoc {
  id: number;
  fields: Record<SearchField, string[]>;
  /** Primeira palavra do nome — quem começa pelo termo buscado sobe. */
  lead: string | null;
}

export type Vocabulary = ReadonlyMap<string, number>;

export interface SearchIndex {
  docs: IndexedDoc[];
  /** Palavra → em quantos produtos aparece (as que só existem nos sinônimos valem 0). */
  vocabulary: Vocabulary;
}

/** Trecho da consulta: as partes e, quando havia pontuação no meio, a forma junta. */
export interface Chunk {
  parts: string[];
  joined: string | null;
}

/** Uma forma aceita para um termo — todas as palavras precisam aparecer no produto. */
export interface Alternative {
  words: string[];
  weight: number;
}

/** Um termo da consulta: basta uma das alternativas casar. */
export interface Concept {
  /** Como o termo entra no "Mostrando resultados para…". */
  label: string;
  alternatives: Alternative[];
}

export interface Correction {
  from: string;
  to: string;
}

export interface ParsedQuery {
  concepts: Concept[];
  corrections: Correction[];
}

/** Grupo de sinônimos: cada termo equivalente é uma sequência de palavras. */
export type SynonymGroup = string[][];

/** "all": todos os termos casaram; "any": nenhum produto tinha todos, vão os mais próximos. */
export type RankMode = "all" | "any";

export interface Ranking {
  ids: number[];
  mode: RankMode;
  corrections: Correction[];
  correctedTerm: string | null;
}
