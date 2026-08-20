'use client'

import { Modal } from '../../components/modal'
import { StatusBadge } from '../../components/status-badge'
import { formatBRL, formatDateTime } from '../../lib/format'
import type { Order } from '../../lib/nest-client'
import { addressLines } from '@/lib/address'

export function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <Modal title={`Pedido #${order.id}`} onClose={onClose}>
      <div className="uai-detail-row">
        <StatusBadge status={order.status} />
        <span className="uai-muted">{formatDateTime(order.createdAt)}</span>
      </div>

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

      {order.payments?.map((payment, i) => (
        <section className="uai-detail-section" key={i}>
          <h3 className="uai-detail-title">Pagamento</h3>
          <p className="uai-muted">
            {payment.method} — {payment.status} — {formatBRL(payment.amount)}
          </p>
        </section>
      ))}
    </Modal>
  )
}
