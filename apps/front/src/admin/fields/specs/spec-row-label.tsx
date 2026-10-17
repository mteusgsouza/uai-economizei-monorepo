'use client'

import { useRowLabel } from '@payloadcms/ui'

const TYPE_LABELS: Record<string, string> = {
  number: 'número',
  text: 'texto',
  boolean: 'sim/não',
  select: 'opções',
}

interface SpecFieldRow {
  label?: string | null
  type?: string | null
  unit?: string | null
}

/** "Memória RAM · número, GB" em vez de "Campo 01" na lista de campos do modelo. */
export function SpecRowLabel() {
  const { data, rowNumber } = useRowLabel<SpecFieldRow>()

  const name = data?.label?.trim() || `Campo ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  const kind = data?.type ? TYPE_LABELS[data.type] : undefined
  // A unidade fica guardada se o tipo deixa de ser número, mas não vale mais
  const unit = data?.type === 'number' ? data.unit?.trim() : undefined
  const detail = kind && unit ? `${kind}, ${unit}` : kind

  return (
    <span>
      {name}
      {detail && <span className="uai-specs__row-kind"> · {detail}</span>}
    </span>
  )
}
