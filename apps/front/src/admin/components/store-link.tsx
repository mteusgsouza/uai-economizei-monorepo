'use client'

import { useDocumentInfo } from '@payloadcms/ui'

import { HeaderSlot } from './header-slot'

/**
 * "Ver na loja" ao lado do título, para comparar a edição com o que o cliente
 * vê. Quem usa decide o endereço a partir do documento salvo, não do
 * formulário: a loja só mostra o que foi salvo.
 */
function StoreLinkAnchor({ href }: { href: string }) {
  return (
    <HeaderSlot>
      <a className="uai-store-link" href={href} target="_blank" rel="noopener noreferrer">
        Ver na loja <span aria-hidden="true">↗</span>
      </a>
    </HeaderSlot>
  )
}

/** Produto: some enquanto inativo, porque a loja dá 404 para ele. */
export function StoreLink() {
  const { id, data } = useDocumentInfo()
  if (!id || !data?.active) return null

  return <StoreLinkAnchor href={`/produtos/${id}`} />
}

/** Página do CMS: segue o slug salvo — trocar o slug só muda o link ao salvar. */
export function PageStoreLink() {
  const { id, data } = useDocumentInfo()
  const slug = typeof data?.slug === 'string' ? data.slug.trim() : ''
  if (!id || !slug) return null

  return <StoreLinkAnchor href={`/${encodeURIComponent(slug)}`} />
}

export default StoreLink
