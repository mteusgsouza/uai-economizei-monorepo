'use server'

import { headers as nextHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { OrderStatus } from '../lib/nest-client'
import { updateOrderStatus as callApi, type MutationResult } from '../lib/nest-mutate'

/**
 * Só quem está autenticado no admin muda o status.
 * A action é acessível por HTTP: sem esta checagem, a chave interna viraria uma
 * rota aberta de escrita em pedido.
 */
async function ensureAdmin(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  return Boolean(user)
}

export async function updateOrderStatusAction(
  orderId: number,
  status: OrderStatus,
): Promise<MutationResult> {
  if (!(await ensureAdmin())) return { ok: false, error: 'Sessão expirada.' }

  const result = await callApi(orderId, status)
  // A tabela acumula páginas em estado do cliente, então ela se atualiza
  // sozinha; isto aqui é para a próxima visita à rota já vir certa.
  if (result.ok) revalidatePath('/admin/pedidos')
  return result
}
