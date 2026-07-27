import type { RevenuePoint } from './nest-client'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  avgTicket: number
}

export type { RevenuePoint }

/**
 * Completa os meses sem pedidos para a série do gráfico ficar contínua.
 * Os totais já vêm somados do banco (`/orders/summary`) — nada é calculado
 * a partir de uma amostra de pedidos aqui.
 */
export function fillMonths(series: RevenuePoint[], months = 12): RevenuePoint[] {
  const byPeriod = new Map(series.map((point) => [point.period, point]))
  const result: RevenuePoint[] = []

  const cursor = new Date()
  cursor.setDate(1)
  cursor.setHours(0, 0, 0, 0)
  cursor.setMonth(cursor.getMonth() - (months - 1))

  for (let i = 0; i < months; i++) {
    const period = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
    result.push(byPeriod.get(period) ?? { period, revenue: 0, orders: 0 })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return result
}
