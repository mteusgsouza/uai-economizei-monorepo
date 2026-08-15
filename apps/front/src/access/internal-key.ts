import { timingSafeEqual } from "crypto"
import type { Access } from "payload"

/**
 * Confere `x-internal-key` contra `INTERNAL_API_KEY` em tempo constante.
 * Sem a env configurada nada passa — um segredo vazio não pode virar
 * "qualquer um escreve".
 */
function hasInternalKey(headers: Request["headers"]): boolean {
  const expected = process.env.INTERNAL_API_KEY
  const provided = headers.get("x-internal-key")

  if (!expected || !provided) return false

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)

  if (providedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

/**
 * Escrita liberada para o admin logado **ou** para chamadas server-to-server
 * que apresentem a chave interna — é assim que a Nest sincroniza preço e
 * subcategoria a partir do Firestore (`apps/api/src/products`). Mesmo segredo
 * e mesma comparação do `InternalKeyGuard` do lado da Nest.
 */
export const authenticatedOrInternalKey: Access = ({ req }) => Boolean(req.user) || hasInternalKey(req.headers)
