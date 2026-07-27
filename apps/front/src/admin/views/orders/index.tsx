import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { ViewShell } from '../../components/view-shell'
import { fetchOrders } from '../../lib/nest-client'
import { OrdersTable } from './orders-table'

/** Lista de pedidos com detalhe — registrada em /admin/pedidos. */
export async function OrdersView({ initPageResult }: AdminViewServerProps) {
  if (!initPageResult?.req?.user) redirect('/admin/login')

  const initial = await fetchOrders({ page: 1, limit: 50 })

  return (
    <ViewShell
      title="Pedidos"
      subtitle={initial.error ? 'Falha ao carregar' : `${initial.totalDocs} pedidos`}
    >
      <OrdersTable initial={initial} />
    </ViewShell>
  )
}

export default OrdersView
