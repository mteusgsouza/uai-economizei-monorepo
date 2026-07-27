/** Filtros das listas do admin, espelhados na query string da URL. */

export interface OrderFilters {
  search?: string
  status?: string
  delivery?: string
  sortBy?: string
  sortOrder?: string
}

export interface CustomerFilters {
  search?: string
  verified?: string
  sortBy?: string
  sortOrder?: string
}

export const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'PREORDER', label: 'Pré-venda' },
]

export const DELIVERY_OPTIONS = [
  { value: '', label: 'Toda entrega' },
  { value: 'shipping', label: 'Envio' },
  { value: 'pickup', label: 'Retirada no balcão' },
]

export const VERIFIED_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Verificados' },
  { value: 'false', label: 'Não verificados' },
]

/** `sortBy` e `sortOrder` viajam juntos num único select. */
export const ORDER_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Mais recentes' },
  { value: 'createdAt:asc', label: 'Mais antigos' },
  { value: 'subtotal:desc', label: 'Maior valor' },
  { value: 'subtotal:asc', label: 'Menor valor' },
]

export const CUSTOMER_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Cadastro mais recente' },
  { value: 'createdAt:asc', label: 'Cadastro mais antigo' },
  { value: 'firstName:asc', label: 'Nome (A-Z)' },
  { value: 'firstName:desc', label: 'Nome (Z-A)' },
]

type Params = Record<string, string | string[] | undefined> | undefined

function first(value: string | string[] | undefined): string | undefined {
  const found = Array.isArray(value) ? value[0] : value
  return found?.trim() ? found : undefined
}

export function readOrderFilters(params: Params): OrderFilters {
  return {
    search: first(params?.search),
    status: first(params?.status),
    delivery: first(params?.delivery),
    sortBy: first(params?.sortBy),
    sortOrder: first(params?.sortOrder),
  }
}

export function readCustomerFilters(params: Params): CustomerFilters {
  return {
    search: first(params?.search),
    verified: first(params?.verified),
    sortBy: first(params?.sortBy),
    sortOrder: first(params?.sortOrder),
  }
}

/** Chave estável dos filtros — usada para remontar a lista quando mudam. */
export function filtersKey(filters: OrderFilters | CustomerFilters): string {
  return Object.entries(filters)
    .filter(([, value]) => value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}
