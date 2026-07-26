import type { Order } from './nest-client'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  avgTicket: number
}

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

export function buildStats(orders: Order[], customerCount: number): DashboardStats {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal ?? 0), 0)
  return {
    totalOrders: orders.length,
    totalRevenue,
    totalCustomers: customerCount,
    avgTicket: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
  }
}

/** Série diária de receita/pedidos dos últimos `days` dias, com dias vazios preenchidos. */
export function buildRevenueSeries(orders: Order[], days = 30): RevenuePoint[] {
  const byDay = new Map<string, RevenuePoint>()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    byDay.set(key, { date: key, revenue: 0, orders: 0 })
  }

  for (const order of orders) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10)
    const point = byDay.get(key)
    if (!point) continue
    point.revenue += order.subtotal ?? 0
    point.orders += 1
  }

  return [...byDay.values()]
}
