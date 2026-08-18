'use client'

import { useField } from '@payloadcms/ui'
import { IconTrash } from '@tabler/icons-react'

import { formatBRL } from '../../lib/format'
import { planPreview } from '../../lib/card-fees'

interface RateRowProps {
  basePath: string
  index: number
  /** Preço de referência da simulação, em centavos. */
  reference: number
  onRemove: (index: number) => void
  disabled: boolean
}

/**
 * Uma linha da tabela de taxas.
 *
 * Cada célula é um campo do formulário do Payload (`rates.N.installments`), então
 * a edição continua passando pela validação e pelo estado normais — a tabela é
 * só uma disposição diferente das mesmas entradas.
 */
export function RateRow({ basePath, index, reference, onRemove, disabled }: RateRowProps) {
  const installments = useField<number>({ path: `${basePath}.${index}.installments` })
  const percent = useField<number>({ path: `${basePath}.${index}.percent` })

  const parcels = installments.value ?? 0
  const fee = percent.value ?? 0
  const plan = planPreview(reference, parcels, fee)
  const free = fee === 0

  return (
    <tr>
      <td>
        <input
          type="number"
          min={1}
          max={24}
          value={parcels || ''}
          disabled={disabled}
          aria-label={`Parcelas da linha ${index + 1}`}
          onChange={(e) => installments.setValue(Number(e.target.value))}
        />
      </td>
      <td>
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={fee || fee === 0 ? fee : ''}
          disabled={disabled}
          aria-label={`Acréscimo da linha ${index + 1}`}
          onChange={(e) => percent.setValue(Number(e.target.value))}
        />
      </td>
      <td className="uai-fees__preview">
        {parcels >= 1 ? (
          <>
            <b>
              {parcels}x de {formatBRL(plan.perInstallment)}
            </b>
            <span>
              {free ? 'sem juros' : `total ${formatBRL(plan.total)}`}
            </span>
          </>
        ) : (
          <span>—</span>
        )}
      </td>
      <td>
        <button
          type="button"
          className="uai-icon-button"
          title="Remover parcelamento"
          aria-label={`Remover a linha ${index + 1}`}
          disabled={disabled}
          onClick={() => onRemove(index)}
        >
          <IconTrash size={16} />
        </button>
      </td>
    </tr>
  )
}
