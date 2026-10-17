const DIACRITICS = /[̀-ͯ]/g;

function fold(text: string): string {
  return text.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

/**
 * "Trocas e Devoluções!" → "trocas-e-devolucoes". Sem acento, caixa ou
 * pontuação; o separador muda para quem precisa de `_` (chaves da ficha).
 */
export function slugify(text: string, separator: "-" | "_" = "-"): string {
  return fold(text)
    .replace(/[^a-z0-9]+/g, separator)
    .replace(separator === "-" ? /^-+|-+$/g : /^_+|_+$/g, "");
}

/**
 * Para enquanto a pessoa digita o endereço: limpa igual ao `slugify`, mas não
 * come o hífen do fim — ela ainda vai escrever a próxima palavra.
 */
export function slugifyTyping(text: string): string {
  return fold(text).replace(/[^a-z0-9]+/g, "-").replace(/^-+/, "");
}
