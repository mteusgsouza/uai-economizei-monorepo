'use client'

import { useDocumentInfo } from '@payloadcms/ui'

import { HeaderSlot } from './header-slot'

/**
 * "Ver na loja" ao lado da tag de status, para comparar a edição com o que o
 * cliente vê. Segue o documento salvo, não o formulário: a loja só mostra o
 * que foi salvo, e produto inativo dá 404 lá.
 */
export function StoreLink() {
  const { id, data } = useDocumentInfo()
  if (!id || !data?.active) return null

  return (
    <HeaderSlot>
      <a
        className="uai-store-link"
        href={`/produtos/${id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver na loja <span aria-hidden="true">↗</span>
      </a>
    </HeaderSlot>
  )
}

export default StoreLink
