'use client'

import { useState } from 'react'
import { IconEye } from '@tabler/icons-react'

import { StatusBadge } from '../../components/status-badge'
import { formatBRL, formatDate } from '../../lib/format'
import type { Order } from '../../lib/nest-client'
import { OrderDetail } from './order-detail'

function customerName(order: Order): string {
  const customer = order.customer
  if (!customer) return '—'
  const full = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()
  return full || customer.email || '—'
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [selected, setSelected] = useState<Order | null>(null)

  if (orders.length === 0) {
    return (
      <div className="uai-panel">
        <p className="uai-empty">
          Nenhum pedido encontrado. Verifique se a API está no ar.
        </p>
      </div>
    )
  }

  return (
    <div className="uai-panel">
      <table className="uai-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Status</th>
            <th>Total</th>
            <th>Data</th>
            <th aria-label="Ações" />
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
              <td>
                <button
                  type="button"
                  className="uai-icon-button"
                  onClick={() => setSelected(order)}
                  aria-label={`Ver pedido #${order.id}`}
                >
                  <IconEye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
