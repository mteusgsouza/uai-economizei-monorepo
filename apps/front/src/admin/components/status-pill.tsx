'use client'

import { useFormFields } from '@payloadcms/ui'

import { HeaderSlot } from './header-slot'

/**
 * Tag de status ao lado do nome do documento.
 *
 * O admin não mostra em lugar nenhum se o produto está no ar — é preciso caçar o
 * checkbox "Ativo" na lateral. O estado acompanha o campo em tempo real: marcar
 * o checkbox já troca a tag, antes de salvar.
 */
export function StatusPill() {
  const active = useFormFields(([fields]) => fields?.active?.value)
  const isLive = Boolean(active)

  return (
    <HeaderSlot>
      <span
        className="uai-status-pill"
        data-state={isLive ? 'live' : 'draft'}
        title={isLive ? 'Visível na loja' : 'Não aparece na loja'}
      >
        {isLive ? 'Publicado' : 'Rascunho'}
      </span>
    </HeaderSlot>
  )
}

export default StatusPill
