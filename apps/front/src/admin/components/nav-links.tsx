import Link from 'next/link'

const LINKS = [
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/clientes', label: 'Clientes' },
]

/** Links das views customizadas, injetados no nav do admin do Payload. */
export function AdminNavLinks() {
  return (
    <div className="uai-nav-group">
      <span className="uai-nav-label">Loja</span>
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="uai-nav-link">
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export default AdminNavLinks
