import { groupSpecFields } from "./groups";
import type { SpecFieldDef, SpecGroup, SpecValue, SpecValues } from "./types";

const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function withUnit(text: string, field: SpecFieldDef): string {
  return field.type === "number" && field.unit ? `${text} ${field.unit}` : text;
}

/** Valor sem campo que o descreva (ex.: fora do modelo) — logo, sem unidade. */
export function formatLooseSpecValue(value: SpecValue): string {
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return typeof value === "number" ? decimal.format(value) : value;
}

/**
 * Valor pronto para exibir. Segue o tipo do valor guardado, não só o do campo:
 * se o lojista mudar o tipo de um campo já preenchido, o valor antigo ainda
 * aparece legível em vez de sumir.
 */
export function formatSpecValue(field: SpecFieldDef, value: SpecValue): string {
  const text = formatLooseSpecValue(value);
  return typeof value === "boolean" ? text : withUnit(text, field);
}

/**
 * Monta a ficha agrupada, na ordem dos campos do modelo. Campo sem valor fica
 * de fora — linha com "—" diz menos que a ausência dela.
 */
export function buildSpecSheet(fields: SpecFieldDef[], values: SpecValues): SpecGroup[] {
  const filled = fields.filter((field) => values[field.key] !== undefined);

  return groupSpecFields(filled).map((group) => ({
    title: group.title,
    rows: group.fields.flatMap((field) => {
      const value = values[field.key];
      if (value === undefined) return [];
      return [{ key: field.key, label: field.label, value: formatSpecValue(field, value) }];
    }),
  }));
}
