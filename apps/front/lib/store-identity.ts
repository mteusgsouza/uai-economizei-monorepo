/**
 * A identidade da loja resolvida: nome e as duas peças da marca.
 *
 * O admin guarda só o que o lojista escreveu; o resto se deriva aqui, para que
 * preencher **um** campo ("Nome da loja") já produza um logo coerente. "UAI
 * Economizei" vira o quadrado "UAI" ao lado da palavra "Economizei" — a marca
 * que o site sempre teve — sem o lojista precisar entender a anatomia dela.
 *
 * Nenhuma loja fica sem nome: em branco vale `DEFAULT_STORE_NAME`, um texto
 * neutro. Deixar o nome de outra loja como padrão seria pior — a loja nova
 * subiria assinada por quem ela não é.
 */

import type { StoreIdentity } from "@/lib/commerce";

/** O que uma loja sem identidade preenchida mostra. */
export const DEFAULT_STORE_NAME = "Loja";

/** Quantas letras cabem no quadrado da marca antes de ele deixar de ser um quadrado. */
const MARK_LENGTH = 3;

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/** O nome da loja, nunca vazio. */
export function storeName(identity: StoreIdentity | null | undefined): string {
  return clean(identity?.name) || DEFAULT_STORE_NAME;
}

/**
 * As duas peças do logo: a sigla do quadrado e a palavra ao lado.
 *
 * Sem override, a primeira palavra do nome vira a sigla e o resto vira a
 * palavra. Nome de uma palavra só não tem "resto": aí ela própria é a palavra,
 * e a sigla sai das suas primeiras letras — "Economizei" dá "ECO Economizei",
 * que ainda lê como marca.
 */
export function storeWordmark(identity: StoreIdentity | null | undefined): {
  mark: string;
  word: string;
} {
  const name = storeName(identity);
  // O default no destructuring cobre o caso que `storeName` já impede (nome
  // vazio) e dispensa um `!` só para convencer o compilador.
  const [first = name, ...rest] = name.split(/\s+/).filter(Boolean);

  const derivedWord = rest.length > 0 ? rest.join(" ") : name;
  const derivedMark = (rest.length > 0 ? first : name).slice(0, MARK_LENGTH);

  return {
    mark: (clean(identity?.logoMark) || derivedMark).toUpperCase(),
    word: clean(identity?.logoWord) || derivedWord,
  };
}

/**
 * A linha de copyright do rodapé. Sem CNPJ cadastrado sai só o nome — melhor
 * do que anunciar um documento que não é o da loja, que é o que um placeholder
 * faria.
 */
export function storeLegalLine(
  identity: StoreIdentity | null | undefined,
  year: number,
): string {
  const who = clean(identity?.legalName) || storeName(identity);
  const taxId = clean(identity?.taxId);
  return taxId ? `© ${year} ${who} · CNPJ ${taxId}` : `© ${year} ${who}`;
}
