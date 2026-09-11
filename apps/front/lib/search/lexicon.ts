/** Palavras que não ajudam a achar produto. "sem" fica de fora: "sem fio" é termo. */
export const STOPWORDS: ReadonlySet<string> = new Set([
  "de", "da", "do", "das", "dos", "e", "com", "para", "pra", "em",
  "no", "na", "a", "o", "as", "os", "um", "uma", "por",
]);

/**
 * Unidades que grudam no número ("8 GB" → "8gb"), com a forma canônica.
 * "pc" junto do número é peça ("129 Pc"), o que tira dele a ambiguidade com
 * computador.
 */
export const UNIT_ALIASES: Readonly<Record<string, string>> = {
  polegadas: "pol", polegada: "pol", pol: "pol",
  metros: "m", metro: "m", m: "m",
  litros: "l", litro: "l", l: "l",
  toneladas: "ton", tonelada: "ton", ton: "ton",
  pecas: "pc", peca: "pc", pcs: "pc", pc: "pc",
  gb: "gb", tb: "tb", mb: "mb", kb: "kb",
  ghz: "ghz", mhz: "mhz", hz: "hz",
  mah: "mah", dpi: "dpi", mbps: "mbps", gbps: "gbps",
  ms: "ms", mm: "mm", cm: "cm", kg: "kg", g: "g", ml: "ml", w: "w", v: "v",
};

/** A marca-curinga dos produtos sem marca não diz nada sobre o produto. */
export const NO_BRAND = "sem marca";

/** Peso de cada campo do produto na nota. */
export const FIELD_WEIGHTS = { name: 1, brand: 0.8, taxonomy: 0.6 } as const;

/** Qualidade do casamento entre uma palavra da consulta e uma do produto. */
export const MATCH_WEIGHTS = { exact: 1, prefix: 0.85, infix: 0.5 } as const;

/** Quanto vale cada forma alternativa de um termo. */
export const ALTERNATIVE_WEIGHTS = {
  original: 1,
  singular: 0.95,
  synonym: 0.9,
  typo1: 0.75,
  typo2: 0.6,
} as const;

/** Bônus: nome que começa pelo primeiro termo; todos os termos no nome. */
export const BONUS = { lead: 0.3, allInName: 0.2 } as const;

/** Limites de defesa: caracteres lidos, trechos analisados e termos na nota. */
export const MAX_QUERY_LENGTH = 100;
export const MAX_CHUNKS = 12;
export const MAX_CONCEPTS = 8;
export const MAX_TYPO_CANDIDATES = 3;
