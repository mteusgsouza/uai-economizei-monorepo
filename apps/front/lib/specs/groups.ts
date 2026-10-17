import type { SpecFieldDef } from "./types";

export interface SpecFieldGroup {
  /** `null` para os campos sem grupo. */
  title: string | null;
  fields: SpecFieldDef[];
}

/** Agrupa os campos pelo `group`, na ordem em que cada grupo aparece primeiro. */
export function groupSpecFields(fields: SpecFieldDef[]): SpecFieldGroup[] {
  const groups = new Map<string | null, SpecFieldGroup>();

  for (const field of fields) {
    const group = groups.get(field.group) ?? { title: field.group, fields: [] };
    group.fields.push(field);
    groups.set(field.group, group);
  }

  return [...groups.values()];
}
