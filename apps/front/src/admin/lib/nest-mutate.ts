import 'server-only'

import type { OrderStatus } from './nest-client'

/** Resultado de uma escrita: ou deu certo, ou tem o que dizer ao operador. */
export interface MutationResult {
  ok: boolean
  error?: string
}

const API_URL = process.env.API_URL ?? 'http://localhost:8080'

/**
 * O lado de escrita das chamadas à Nest, separado do `nest-client` de propósito:
 * lá tudo devolve `Page<T>` para alimentar listagem, e espremer um PATCH naquele
 * formato só esconderia se a gravação deu certo.
 */
async function nestMutate(
  path: string,
  method: 'PATCH' | 'POST',
  body: unknown,
): Promise<MutationResult> {
  const internalKey = process.env.INTERNAL_API_KEY
  if (!internalKey) {
    console.error('[admin] INTERNAL_API_KEY ausente — configure o .env do front')
    return { ok: false, error: 'Chave interna não configurada.' }
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'x-internal-key': internalKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[admin] ${method} ${path} respondeu ${res.status}: ${text.slice(0, 300)}`)
      return { ok: false, error: `A API respondeu ${res.status}.` }
    }

    return { ok: true }
  } catch (err) {
    console.error(`[admin] falha ao chamar ${method} ${path}:`, err)
    return { ok: false, error: 'Não foi possível falar com a API.' }
  }
}

/** Move o pedido pelo fluxo. Quem valida o valor é a API. */
export function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<MutationResult> {
  return nestMutate(`/orders/admin/${id}/status`, 'PATCH', { status })
}
