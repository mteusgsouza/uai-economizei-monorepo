'use client'

import { useField } from '@payloadcms/ui'

import { formatBRL } from '../lib/format'

/**
 * Mostra o valor formatado em reais ao lado de um campo em centavos,
 * evitando o erro clássico de digitar 100 achando que são R$ 100,00.
 */
export function PriceHint({ path }: { path: string }) {
  const { value } = useField<number>({ path })

  if (typeof value !== 'number' || Number.isNaN(value)) return null

  return <p className="uai-field-hint">Equivale a {formatBRL(value)}</p>
}

export default PriceHint
