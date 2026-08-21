'use client'

import { useState, useTransition } from 'react'

import { updateOrderStatusAction } from '../../actions/update-order-status'
import { ORDER_STATUS_OPTIONS } from '../../lib/filters'
import type { OrderStatus } from '../../lib/nest-client'

/** As mesmas opções do filtro, sem a entrada vazia — aqui não existe "todos". */
const STATUS_OPTIONS = ORDER_STATUS_OPTIONS.filter((option) => option.value)

/**
 * Mover o pedido pelo fluxo. Grava sob demanda, não no `change`: um select que
 * salva sozinho transforma rolagem distraída em pedido cancelado.
 */
export function OrderStatusForm({
  orderId,
  status,
  onSaved,
}: {
  orderId: number
  status: OrderStatus
  onSaved: (status: OrderStatus) => void
}) {
  const [draft, setDraft] = useState<OrderStatus>(status)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const save = () => {
    setError(undefined)
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, draft)
      if (result.ok) onSaved(draft)
      else setError(result.error ?? 'Não foi possível salvar.')
    })
  }

  return (
    <div className="uai-detail-row">
      <select
        className="uai-filter-select"
        value={draft}
        disabled={isPending}
        onChange={(event) => setDraft(event.target.value as OrderStatus)}
        aria-label="Status do pedido"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="uai-button"
        onClick={save}
        disabled={draft === status || isPending}
      >
        {isPending ? 'Salvando…' : 'Salvar'}
      </button>
      {error && <span className="uai-muted">{error}</span>}
    </div>
  )
}
