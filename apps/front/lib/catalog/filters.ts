import type { Where } from "payload";

/**
 * O recorte do catálogo que o site pode mostrar.
 *
 * Existe porque `{ active: { equals: true } }` estava escrito à mão em seis
 * queries diferentes — e foi exatamente isso que deixou o estoque de fora de
 * todas elas: a opção `inStock` chegou a ser implementada e nunca foi ligada
 * por ninguém. Com um ponto só, esquecer uma listagem deixa de ser possível.
 *
 * `stock` nulo cai fora do `greater_than`, e está certo: `mapProduct` já lê
 * `doc.stock ?? 0`, então nulo sempre significou zero.
 *
 * Não use isto no admin nem no sync da Nest — os dois precisam do catálogo
 * inteiro, inativo e esgotado incluídos.
 */
export const ACTIVE: Where = { active: { equals: true } };
export const IN_STOCK: Where = { stock: { greater_than: 0 } };

/** Ativo e com peça: o que um cliente pode de fato comprar. */
export const AVAILABLE: Where[] = [ACTIVE, IN_STOCK];
