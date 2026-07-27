import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { fetchOrders, fetchSummary } from '../../lib/nest-client'
import { fillMonths } from '../../lib/stats'
import { ViewShell } from '../../components/view-shell'
import { RecentOrders } from './recent-orders'
import { RevenueChart } from './revenue-chart'
import { StatsCards } from './stats-cards'

/** Dashboard de vendas — substitui a view padrão do Payload em /admin. */
export async function DashboardView({ initPageResult }: AdminViewServerProps) {
  if (!initPageResult?.req?.user) redirect('/admin/login')

  // Totais somados no banco; a lista traz só os pedidos exibidos
  const [summary, recent] = await Promise.all([
    fetchSummary(),
    fetchOrders({ page: 1, limit: 8 }),
  ])

  if (!summary) {
    return (
      <ViewShell title="Dashboard" subtitle="Visão geral da loja">
        <div className="uai-panel">
          <p className="uai-empty">
            Não foi possível carregar os indicadores. Verifique se a API está no ar.
          </p>
        </div>
      </ViewShell>
    )
  }

  const stats = {
    totalOrders: summary.totalOrders,
    totalRevenue: summary.totalRevenue,
    totalCustomers: summary.totalCustomers,
    avgTicket: summary.avgTicket,
  }

  return (
    <ViewShell title="Dashboard" subtitle="Visão geral da loja">
      <StatsCards stats={stats} />
      <RevenueChart data={fillMonths(summary.series)} />
      <RecentOrders orders={recent.docs} />
    </ViewShell>
  )
}

export default DashboardView
