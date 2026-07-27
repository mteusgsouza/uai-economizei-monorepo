'use client'

import { Link, NavGroup } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin/pedidos', label: 'Pedidos', id: 'nav-pedidos' },
  { href: '/admin/clientes', label: 'Clientes', id: 'nav-clientes' },
]

/**
 * Links das views customizadas no nav do admin.
 *
 * Usa o mesmo `NavGroup` e as mesmas classes dos itens nativos (`nav__link`),
 * para herdar alinhamento, espaçamento e o recolher do grupo — recriar o
 * estilo por fora era o que deixava este bloco desalinhado.
 */
export function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <NavGroup label="Loja">
      {LINKS.map(({ href, label, id }) => {
        const isActive = pathname.startsWith(href)
        return (
          <Link className="nav__link" href={href} id={id} key={href} prefetch={false}>
            {isActive && <div className="nav__link-indicator" />}
            <span className="nav__link-label">{label}</span>
          </Link>
        )
      })}
    </NavGroup>
  )
}

export default AdminNavLinks
