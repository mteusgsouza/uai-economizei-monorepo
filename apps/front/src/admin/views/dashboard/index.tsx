import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { fetchCustomers, fetchOrders } from '../../lib/nest-client'
import { buildRevenueSeries, buildStats } from '../../lib/stats'
import { ViewShell } from '../../components/view-shell'
import { RecentOrders } from './recent-orders'
import { RevenueChart } from './revenue-chart'
import { StatsCards } from './stats-cards'

/** Dashboard de vendas — substitui a view padrão do Payload em /admin. */
export async function DashboardView({ initPageResult }: AdminViewServerProps) {
  if (!initPageResult?.req?.user) redirect('/admin/login')

  const [orders, customers] = await Promise.all([fetchOrders(200), fetchCustomers(200)])

  const stats = buildStats(orders, customers.length)
  const series = buildRevenueSeries(orders, 30)

  return (
    <ViewShell title="Dashboard" subtitle="Visão geral da loja">
      <StatsCards stats={stats} />
      <RevenueChart data={series} />
      <RecentOrders orders={orders.slice(0, 8)} />
    </ViewShell>
  )
}

export default DashboardView
