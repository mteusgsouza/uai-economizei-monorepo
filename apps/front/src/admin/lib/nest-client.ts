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

const API_URL = process.env.API_URL ?? 'http://localhost:8080'

/**
 * Chama a API Nest server-side com a chave interna.
 * Nunca deve ser importado por client component — o `server-only` garante isso.
 */
async function nestFetch<T>(path: string): Promise<T[]> {
  const internalKey = process.env.INTERNAL_API_KEY
  if (!internalKey) return []

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'x-internal-key': internalKey },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (Array.isArray(data)) return data as T[]
    if (data && typeof data === 'object' && Array.isArray((data as { docs?: T[] }).docs)) {
      return (data as { docs: T[] }).docs
    }
    return []
  } catch {
    // Nest offline — o admin do Payload continua utilizável
    return []
  }
}

export function fetchOrders(limit = 50): Promise<Order[]> {
  return nestFetch<Order>(`/orders/all?sortBy=createdAt&sortOrder=desc&limit=${limit}`)
}

export function fetchCustomers(limit = 50): Promise<Customer[]> {
  return nestFetch<Customer>(`/customers?sortBy=createdAt&sortOrder=desc&limit=${limit}`)
}
