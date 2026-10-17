/** "Memória RAM" → "memoria_ram". Sem acento, caixa ou pontuação. */
export function specKey(label: string): string {
  const key = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return key || "campo";
}

interface KeyedField {
  label?: string | null;
  key?: string | null;
}

/**
 * Preenche a chave dos campos que ainda não têm uma e garante que não se
 * repitam dentro do modelo. Chave existente nunca muda: é ela que liga o valor
 * guardado no produto ao campo, então renomear o campo não perde o que já foi
 * preenchido.
 */
export function withSpecKeys<T extends KeyedField>(fields: T[]): Array<T & { key: string }> {
  const used = new Set<string>();

  return fields.map((field) => {
    const base = field.key?.trim() || specKey(field.label ?? "");
    let key = base;
    for (let n = 2; used.has(key); n++) key = `${base}_${n}`;
    used.add(key);
    return { ...field, key };
  });
}
