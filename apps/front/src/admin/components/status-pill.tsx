'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFormFields } from '@payloadcms/ui'

/**
 * Tag de status ao lado do nome do documento.
 *
 * O admin não mostra em lugar nenhum se o produto está no ar — é preciso caçar o
 * checkbox "Ativo" na lateral. O estado acompanha o campo em tempo real: marcar
 * o checkbox já troca a tag, antes de salvar.
 *
 * O Payload não expõe slot ao lado do título (só `beforeDocumentControls`,
 * `editMenuItems`, os botões e `Status`), então o componente é montado no slot
 * dos controles — onde tem o contexto do formulário — e portado para o header.
 * O `h1` tem `overflow: hidden` com ellipsis, então a tag entra como irmã dele e
 * não dentro: `.doc-header__header` já é flex row centrado, com gap próprio.
 */
export function StatusPill() {
  const active = useFormFields(([fields]) => fields?.active?.value)

  // O nó nasce uma vez, no inicializador — não em efeito. Renderizar dentro dele
  // antes de estar no documento é válido: o efeito só o encaixa no header.
  // `document` não existe no SSR do admin, daí a guarda.
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

  const isLive = Boolean(active)

  return createPortal(
    <span
      className="uai-status-pill"
      data-state={isLive ? 'live' : 'draft'}
      title={isLive ? 'Visível na loja' : 'Não aparece na loja'}
    >
      {isLive ? 'Publicado' : 'Rascunho'}
    </span>,
    slot,
  )
}

export default StatusPill
