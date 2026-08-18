'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFormFields } from '@payloadcms/ui'

import { promotionStatus } from '../lib/promotion-status'

/**
 * Situação da promoção ao lado do nome, no header do documento.
 *
 * Mesma mecânica da tag de produto: o Payload não expõe slot junto ao título,
 * então o componente monta no slot dos controles — onde tem contexto de
 * formulário — e é portado para o header. A diferença é o que ele responde:
 * aqui "Ativa" não basta, porque as datas decidem se está no ar de fato.
 */
export function PromotionStatusPill() {
  const active = useFormFields(([fields]) => fields?.active?.value)
  const startDate = useFormFields(([fields]) => fields?.startDate?.value)
  const endDate = useFormFields(([fields]) => fields?.endDate?.value)

  const [slot] = useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null
    const el = document.createElement('span')
    el.className = 'uai-status-pill-slot'
    return el
  })

  useEffect(() => {
    if (!slot) return
    const title = document.querySelector('.doc-header__title')
    if (!title) return

    title.insertAdjacentElement('afterend', slot)
    return () => {
      slot.remove()
    }
  }, [slot])

  if (!slot) return null

  const status = promotionStatus(
    active as boolean | null,
    startDate as string | null,
    endDate as string | null,
  )

  return createPortal(
    <span className="uai-status-pill" data-state={status.state} title={status.detail}>
      {status.label}
    </span>,
    slot,
  )
}

export default PromotionStatusPill
