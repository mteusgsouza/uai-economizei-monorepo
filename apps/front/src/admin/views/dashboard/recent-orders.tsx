import { StatusBadge } from '../../components/status-badge'
import { formatBRL, formatDate } from '../../lib/format'
import type { Order } from '../../lib/nest-client'

function customerName(order: Order): string {
  const customer = order.customer
  if (!customer) return '—'
  const full = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()
  return full || customer.email || '—'
}

/** Últimos pedidos, exibidos no dashboard. */
export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="uai-panel">
      <div className="uai-panel-header">
        <div>
          <h2 className="uai-panel-title">Pedidos recentes</h2>
          <p className="uai-panel-subtitle">Últimos {orders.length} pedidos</p>
        </div>
        <a className="uai-link" href="/admin/pedidos">
          Ver todos
        </a>
      </div>

      {orders.length === 0 ? (
        <p className="uai-empty">Nenhum pedido encontrado.</p>
      ) : (
        <table className="uai-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Total</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="uai-mono">#{order.id}</td>
                <td>{customerName(order)}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>{formatBRL(order.subtotal)}</td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
