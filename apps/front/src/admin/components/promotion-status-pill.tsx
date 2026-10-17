'use client'

import { useFormFields } from '@payloadcms/ui'

import { promotionStatus } from '../lib/promotion-status'
import { HeaderSlot } from './header-slot'

/**
 * Situação da promoção ao lado do nome, no header do documento.
 *
 * Mesma mecânica da tag de produto (ver `HeaderSlot`). A diferença é o que ele
 * responde: aqui "Ativa" não basta, porque as datas decidem se está no ar de fato.
 */
export function PromotionStatusPill() {
  const active = useFormFields(([fields]) => fields?.active?.value)
  const startDate = useFormFields(([fields]) => fields?.startDate?.value)
  const endDate = useFormFields(([fields]) => fields?.endDate?.value)

  const status = promotionStatus(
    active as boolean | null,
    startDate as string | null,
    endDate as string | null,
  )

  return (
    <HeaderSlot>
      <span className="uai-status-pill" data-state={status.state} title={status.detail}>
        {status.label}
      </span>
    </HeaderSlot>
  )
}

export default PromotionStatusPill
