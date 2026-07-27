'use server'

import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import {
  fetchCustomers,
  fetchOrders,
  type Customer,
  type Order,
  type Page,
} from '../lib/nest-client'

const DENIED = { docs: [], totalDocs: 0, page: 1, totalPages: 0, hasNextPage: false }

/**
 * Só quem está autenticado no admin pode paginar.
 * A action é acessível por HTTP, então checar a sessão aqui não é redundante.
 */
async function ensureAdmin(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  return Boolean(user)
}

export async function loadOrdersPage(page: number): Promise<Page<Order>> {
  if (!(await ensureAdmin())) return { ...DENIED, error: 'Sessão expirada.' }
  return fetchOrders({ page })
}

export async function loadCustomersPage(page: number): Promise<Page<Customer>> {
  if (!(await ensureAdmin())) return { ...DENIED, error: 'Sessão expirada.' }
  return fetchCustomers({ page })
}
