'use client'

import { useState, useTransition } from 'react'
import { IconEye } from '@tabler/icons-react'

import useInfiniteScroll from '../../../../hooks/useInfiniteScroll'
import { loadOrdersPage } from '../../actions/load-page'
import { StatusBadge } from '../../components/status-badge'
import { LoadMoreSentinel } from '../../components/load-more-sentinel'
import { formatBRL, formatDate } from '../../lib/format'
import type { OrderFilters } from '../../lib/filters'
import type { Order, Page } from '../../lib/nest-client'
import { OrderDetail } from './order-detail'

function customerName(order: Order): string {
  const customer = order.customer
  if (!customer) return '—'
  const full = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim()
  return full || customer.email || '—'
}

export function OrdersTable({
  initial,
  filters = {},
}: {
  initial: Page<Order>
  filters?: OrderFilters
}) {
  const [orders, setOrders] = useState<Order[]>(initial.docs)
  const [page, setPage] = useState(initial.page)
  const [hasNextPage, setHasNextPage] = useState(initial.hasNextPage)
  const [error, setError] = useState(initial.error)
  const [isPending, startTransition] = useTransition()

  const fetchNextPage = () => {
    startTransition(async () => {
      const next = await loadOrdersPage(page + 1, filters)
      if (next.error) {
        setError(next.error)
        setHasNextPage(false)
        return
      }
      setOrders((current) => [...current, ...next.docs])
      setPage(next.page)
      setHasNextPage(next.hasNextPage)
    })
  }

  const { observerElem } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage: isPending,
    fetchNextPage,
  })
  const [selected, setSelected] = useState<Order | null>(null)

  if (orders.length === 0) {
    return (
      <div className="uai-panel">
        <p className="uai-empty">
          {error
            ? `Não foi possível carregar os pedidos. ${error}`
            : 'Nenhum pedido encontrado com esses filtros.'}
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

      <LoadMoreSentinel
        ref={observerElem}
        loading={isPending}
        hasNextPage={hasNextPage}
        error={error}
        loaded={orders.length}
        total={initial.totalDocs}
      />

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
