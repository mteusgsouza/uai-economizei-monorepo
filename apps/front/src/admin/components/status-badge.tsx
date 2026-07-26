import type { OrderStatus } from '../lib/nest-client'

const LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  PREORDER: 'Pré-venda',
}

const TONES: Record<OrderStatus, string> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error',
  PREORDER: 'neutral',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="uai-badge" data-tone={TONES[status] ?? 'neutral'}>
      {LABELS[status] ?? status}
    </span>
  )
}
