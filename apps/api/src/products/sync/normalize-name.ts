/**
 * Remove acentos, baixa a caixa e colapsa espaços. O nome do produto é a única
 * chave em comum entre Firestore e Payload, e as duas bases divergem na grafia
 * (`Informática` x `INFORMATICA`, espaço duplo, espaço no fim).
 */
export function normalizeName(value: string): string {
  const withoutDiacritics = Array.from(value.normalize('NFKD'))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      // Faixa Unicode dos sinais diacríticos combinantes (U+0300-U+036F).
      return code < 0x0300 || code > 0x036f;
    })
    .join('');

  return withoutDiacritics.toLowerCase().trim().replace(/\s+/g, ' ');
}
