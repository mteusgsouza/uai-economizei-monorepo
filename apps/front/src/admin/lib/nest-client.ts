import 'server-only'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PREORDER'

export interface OrderCustomer {
  email?: string
  firstName?: string | null
  lastName?: string | null
}

export interface OrderItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
}

export interface OrderPayment {
  method: string
  status: string
  amount: number
}

export interface OrderAddress {
  street?: string
  number?: string
  city?: string
  state?: string
  postalCode?: string
}

export interface Order {
  id: number
  status: OrderStatus
  subtotal: number
  totalProducts: number
  createdAt: string
  customer?: OrderCustomer
  items?: OrderItem[]
  payments?: OrderPayment[]
  address?: OrderAddress
}

export interface Customer {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  verifiedUser?: boolean
  createdAt?: string
  _count?: { orders?: number }
}

export interface RevenuePoint {
  period: string
  revenue: number
  orders: number
}

export interface OrdersSummary {
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  totalCustomers: number
  series: RevenuePoint[]
}

/** Página de resultados, espelhando o envelope das rotas custom da API. */
export interface Page<T> {
  docs: T[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  /** Mensagem quando a busca falhou — permite distinguir vazio de erro. */
  error?: string
}

const API_URL = process.env.API_URL ?? 'http://localhost:8080'
const EMPTY_PAGE = { docs: [], totalDocs: 0, page: 1, totalPages: 0, hasNextPage: false }

/**
 * Chama a API Nest server-side com a chave interna.
 * Falhas são registradas e devolvidas em `error` — devolver lista vazia calada
 * já esconde bug de contrato (um 400 virou "nenhum pedido" por semanas).
 */
async function nestFetch<T>(path: string): Promise<Page<T>> {
  const internalKey = process.env.INTERNAL_API_KEY
  if (!internalKey) {
    console.error('[admin] INTERNAL_API_KEY ausente — configure o .env do front')
    return { ...EMPTY_PAGE, error: 'Chave interna não configurada.' }
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'x-internal-key': internalKey },
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`[admin] ${path} respondeu ${res.status}: ${body.slice(0, 300)}`)
      return { ...EMPTY_PAGE, error: `A API respondeu ${res.status}.` }
    }

    const data: unknown = await res.json()

    if (isPage<T>(data)) {
      return {
        docs: data.docs,
        totalDocs: data.totalDocs ?? data.docs.length,
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1,
        hasNextPage: data.hasNextPage ?? false,
      }
    }

    // Rota ainda sem paginação: trata como página única
    if (Array.isArray(data)) {
      return {
        docs: data as T[],
        totalDocs: data.length,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
      }
    }

    console.error(`[admin] ${path} devolveu formato inesperado`)
    return { ...EMPTY_PAGE, error: 'Resposta em formato inesperado.' }
  } catch (err) {
    console.error(`[admin] falha ao chamar ${path}:`, err)
    return { ...EMPTY_PAGE, error: 'Não foi possível falar com a API.' }
  }
}

function isPage<T>(data: unknown): data is Page<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as { docs?: unknown }).docs)
  )
}

export interface PageQuery {
  page?: number
  limit?: number
}

export function fetchOrders({ page = 1, limit = 50 }: PageQuery = {}): Promise<Page<Order>> {
  const params = new URLSearchParams({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: String(page),
    limit: String(limit),
  })
  return nestFetch<Order>(`/orders/all?${params}`)
}

export function fetchCustomers({ page = 1, limit = 50 }: PageQuery = {}): Promise<Page<Customer>> {
  const params = new URLSearchParams({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: String(page),
    limit: String(limit),
  })
  return nestFetch<Customer>(`/customers?${params}`)
}

/** Totais do dashboard, já somados no banco pela API. */
export async function fetchSummary(): Promise<OrdersSummary | null> {
  const internalKey = process.env.INTERNAL_API_KEY
  if (!internalKey) return null

  try {
    const res = await fetch(`${API_URL}/orders/summary`, {
      headers: { 'x-internal-key': internalKey },
      cache: 'no-store',
    })
    if (!res.ok) {
      console.error(`[admin] /orders/summary respondeu ${res.status}`)
      return null
    }
    return (await res.json()) as OrdersSummary
  } catch (err) {
    console.error('[admin] falha ao buscar o resumo:', err)
    return null
  }
}
