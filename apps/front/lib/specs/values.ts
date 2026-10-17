import type { SpecTemplate } from "@/payload-types";
import type { SpecFieldDef, SpecFieldType, SpecValue, SpecValues } from "./types";

const FIELD_TYPES: readonly SpecFieldType[] = ["number", "text", "boolean", "select"];

function isFieldType(value: unknown): value is SpecFieldType {
  return FIELD_TYPES.includes(value as SpecFieldType);
}

/** Campo do modelo como sai do Payload — tanto da Local API quanto da REST. */
export type RawSpecField = NonNullable<SpecTemplate["fields"]>[number];

/** Normaliza os campos de um modelo, descartando os que vieram incompletos. */
export function toSpecFieldDefs(fields: RawSpecField[] | null | undefined): SpecFieldDef[] {
  return (fields ?? []).flatMap((field) => {
    if (!field.key || !field.label || !isFieldType(field.type)) return [];
    return [
      {
        key: field.key,
        label: field.label,
        type: field.type,
        unit: field.type === "number" ? field.unit?.trim() || null : null,
        options: (field.options ?? []).filter((option) => option.trim() !== ""),
        group: field.group?.trim() || null,
      },
    ];
  });
}

/**
 * Campos do modelo do produto primeiro, depois os comuns da categoria. Se os
 * dois definem a mesma chave, vale o do modelo — é o mais específico.
 */
export function mergeSpecFields(model: SpecFieldDef[], common: SpecFieldDef[]): SpecFieldDef[] {
  const keys = new Set(model.map((field) => field.key));
  return [...model, ...common.filter((field) => !keys.has(field.key))];
}

function cleanValue(value: unknown): SpecValue | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  return null;
}

/** Lê o JSON guardado no produto, mantendo só valores primitivos preenchidos. */
export function parseSpecValues(raw: unknown): SpecValues {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};

  const values: SpecValues = {};
  for (const [key, value] of Object.entries(raw)) {
    const clean = cleanValue(value);
    if (clean !== null) values[key] = clean;
  }
  return values;
}

/** Troca um valor; vazio remove a chave em vez de guardar string em branco. */
export function setSpecValue(values: SpecValues, key: string, next: SpecValue | null): SpecValues {
  const rest = { ...values };
  delete rest[key];
  const clean = cleanValue(next);
  return clean === null ? rest : { ...rest, [key]: clean };
}

/** Chaves com valor no produto que nenhum campo do modelo define mais. */
export function orphanKeys(values: SpecValues, fields: SpecFieldDef[]): string[] {
  const known = new Set(fields.map((field) => field.key));
  return Object.keys(values).filter((key) => !known.has(key));
}

/**
 * Número digitado do jeito brasileiro: "15,6", "1.200" ou "1.200,5". Ponto
 * sozinho seguido de três dígitos é milhar; nos demais casos, decimal.
 */
export function parseDecimal(text: string): number | null {
  const raw = text.trim().replace(/\s/g, "");
  if (!raw) return null;

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : /^-?\d{1,3}(\.\d{3})+$/.test(raw)
      ? raw.replace(/\./g, "")
      : raw;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
