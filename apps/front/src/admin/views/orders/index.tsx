import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'

import { ViewShell } from '../../components/view-shell'
import { fetchOrders } from '../../lib/nest-client'
import { OrdersTable } from './orders-table'

/** Lista de pedidos com detalhe — registrada em /admin/pedidos. */
export async function OrdersView({ initPageResult }: AdminViewServerProps) {
  if (!initPageResult?.req?.user) redirect('/admin/login')

  const orders = await fetchOrders(100)

  return (
    <ViewShell title="Pedidos" subtitle={`${orders.length} pedidos mais recentes`}>
      <OrdersTable orders={orders} />
    </ViewShell>
  )
}

export default OrdersView
