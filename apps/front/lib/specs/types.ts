/** Tipos de campo que um modelo de ficha técnica aceita. */
export type SpecFieldType = "number" | "text" | "boolean" | "select";

/** Um campo da ficha, como o modelo o define no admin. */
export interface SpecFieldDef {
  /** Identificador estável do valor no produto — não muda quando o nome muda. */
  key: string;
  label: string;
  type: SpecFieldType;
  /** Só para `number`: GB, W, L, peças… */
  unit: string | null;
  /** Só para `select`. */
  options: string[];
  /** Agrupa os campos na página do produto (Desempenho, Tela…). */
  group: string | null;
}

export type SpecValue = string | number | boolean;

/** Valores da ficha de um produto, indexados pela `key` do campo. */
export type SpecValues = Record<string, SpecValue>;

export interface SpecRow {
  key: string;
  label: string;
  value: string;
}

export interface SpecGroup {
  /** `null` para os campos sem grupo. */
  title: string | null;
  rows: SpecRow[];
}
