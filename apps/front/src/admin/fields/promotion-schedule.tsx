'use client'

import { useFormFields } from '@payloadcms/ui'

import { promotionStatus } from '../lib/promotion-status'

/**
 * Explica, embaixo das datas, o que elas produzem.
 *
 * Campo `ui`: não guarda nada, só lê o formulário. Existe porque a combinação de
 * "Ativa" com início e fim não é óbvia — sem isto é preciso simular mentalmente
 * o filtro do carrossel para saber se a promoção está no ar.
 */
export function PromotionSchedule() {
  const active = useFormFields(([fields]) => fields?.active?.value)
  const startDate = useFormFields(([fields]) => fields?.startDate?.value)
  const endDate = useFormFields(([fields]) => fields?.endDate?.value)

  const status = promotionStatus(
    active as boolean | null,
    startDate as string | null,
    endDate as string | null,
  )

  return (
    <div className="uai-preview">
      <div className="uai-preview__head">
        <span>Situação</span>
        <span>calculada das datas</span>
      </div>
      <div className="uai-preview__body uai-preview__body--row">
        <span className="uai-status-pill" data-state={status.state}>
          {status.label}
        </span>
        <p className="uai-preview__note">{status.detail}</p>
      </div>
    </div>
  )
}

export default PromotionSchedule
