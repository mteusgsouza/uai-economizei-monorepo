import { IconCoin, IconShoppingCart, IconTrendingUp, IconUsers } from '@tabler/icons-react'

import { formatBRL } from '../../lib/format'
import type { DashboardStats } from '../../lib/stats'

interface StatCard {
  label: string
  value: string
  Icon: typeof IconCoin
}

function StatTile({ label, value, Icon }: StatCard) {
  return (
    <div className="uai-card">
      <div className="uai-card-header">
        <span className="uai-card-label">{label}</span>
        <Icon className="uai-card-icon" />
      </div>
      <p className="uai-card-value">{value}</p>
    </div>
  )
}

/** Quatro KPIs do topo do dashboard, calculados server-side. */
export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards: StatCard[] = [
    { label: 'Receita Total', value: formatBRL(stats.totalRevenue), Icon: IconCoin },
    { label: 'Pedidos', value: String(stats.totalOrders), Icon: IconShoppingCart },
    { label: 'Clientes', value: String(stats.totalCustomers), Icon: IconUsers },
    { label: 'Ticket Médio', value: formatBRL(stats.avgTicket), Icon: IconTrendingUp },
  ]

  return (
    <div className="uai-stats-grid">
      {cards.map((card) => (
        <StatTile key={card.label} {...card} />
      ))}
    </div>
  )
}
