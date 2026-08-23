'use server'

import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import {
  subscribeAdminPush,
  unsubscribeAdminPush,
  type MutationResult,
  type PushSubscriptionPayload,
} from '../lib/nest-mutate'

/**
 * Só quem está autenticado no admin assina os alertas.
 * A action é acessível por HTTP: sem esta checagem, a chave interna viraria uma
 * rota aberta para inscrever qualquer navegador nos pedidos da loja.
 */
async function ensureAdmin(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  return Boolean(user)
}

/**
 * A chave pública VAPID, que vive na API e não no front.
 *
 * Ela não é segredo, mas buscá-la por aqui evita reabrir uma rota do `/bff` só
 * para isso — e mantém `API_URL` fora do bundle, que é a razão de o proxy
 * existir.
 */
export async function getVapidPublicKeyAction(): Promise<string | null> {
  if (!(await ensureAdmin())) return null

  try {
    const apiUrl = process.env.API_URL ?? 'http://localhost:8080'
    const res = await fetch(`${apiUrl}/notifications/public-key`, {
      cache: 'no-store',
    })
    if (!res.ok) return null

    const { publicKey } = (await res.json()) as { publicKey?: string }
    return publicKey ?? null
  } catch (err) {
    console.error('[admin] falha ao buscar a chave VAPID:', err)
    return null
  }
}

export async function subscribeAdminPushAction(
  subscription: PushSubscriptionPayload,
): Promise<MutationResult> {
  if (!(await ensureAdmin())) return { ok: false, error: 'Sessão expirada.' }
  return subscribeAdminPush(subscription)
}

export async function unsubscribeAdminPushAction(
  endpoint: string,
): Promise<MutationResult> {
  if (!(await ensureAdmin())) return { ok: false, error: 'Sessão expirada.' }
  return unsubscribeAdminPush(endpoint)
}
