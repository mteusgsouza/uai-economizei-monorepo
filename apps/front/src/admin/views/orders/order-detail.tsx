'use client'

import { Modal } from '../../components/modal'
import { StatusBadge } from '../../components/status-badge'
import { formatBRL, formatDateTime } from '../../lib/format'
import type { Order, OrderStatus } from '../../lib/nest-client'
import { OrderStatusForm } from './order-status-form'
import { addressLines } from '@/lib/address'

export function OrderDetail({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order
  onClose: () => void
  onStatusChange: (orderId: number, status: OrderStatus) => void
}) {
  return (
    <Modal title={`Pedido #${order.id}`} onClose={onClose}>
      <div className="uai-detail-row">
        <StatusBadge status={order.status} />
        <span className="uai-muted">{formatDateTime(order.createdAt)}</span>
      </div>

      <OrderStatusForm
        orderId={order.id}
        status={order.status}
        onSaved={(status) => onStatusChange(order.id, status)}
      />

      <section className="uai-detail-section">
        <h3 className="uai-detail-title">Itens ({order.totalProducts})</h3>
        {order.items && order.items.length > 0 ? (
          <table className="uai-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Unitário</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="uai-mono">#{item.productId}</td>
                  <td>{item.quantity}</td>
                  <td>{formatBRL(item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="uai-muted">Sem itens detalhados.</p>
        )}
        <p className="uai-detail-total">Total: {formatBRL(order.subtotal)}</p>
      </section>

      <section className="uai-detail-section">
        <h3 className="uai-detail-title">Entrega</h3>
        {/* Só a flag decide — é o que o filtro da listagem consulta. */}
        {order.retiraBalcao ? (
          <p className="uai-muted">Retirada no balcão</p>
        ) : order.address ? (
          addressLines(order.address).map((line) => (
            <p className="uai-muted" key={line}>
              {line}
            </p>
          ))
        ) : (
          <p className="uai-muted">Endereço não registrado</p>
        )}
      </section>

      {/* Sem pagamento gravado o pedido é orçamento: o acerto foi fora do site. */}
      {order.payments && order.payments.length > 0 ? (
        order.payments.map((payment, i) => (
          <section className="uai-detail-section" key={i}>
            <h3 className="uai-detail-title">Pagamento</h3>
            <p className="uai-muted">
              {payment.method} — {payment.status} — {formatBRL(payment.amount)}
            </p>
          </section>
        ))
      ) : (
        <section className="uai-detail-section">
          <h3 className="uai-detail-title">Pagamento</h3>
          <p className="uai-muted">Orçamento — pagamento fora do site</p>
        </section>
      )}
    </Modal>
  )
}
