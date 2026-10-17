/**
 * Id de um campo `relationship` do Payload. O mesmo campo chega como número,
 * como string (form state do admin) ou como o doc inteiro (com `depth`).
 */
export function relationId(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const id = Number(value);
    return Number.isFinite(id) ? id : null;
  }
  if (typeof value === "object" && value !== null && "id" in value) return relationId(value.id);
  return null;
}
