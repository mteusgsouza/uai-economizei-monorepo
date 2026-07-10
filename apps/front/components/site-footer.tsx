import Link from "next/link";

const footerLinks = {
  navegar: [
    { label: "Categorias", href: "/categorias" },
    { label: "Marcas", href: "/marcas" },
    { label: "Mais Vendidos", href: "/mais-vendidos" },
    { label: "Novidades", href: "/novidades" },
  ],
  ajuda: [
    { label: "Contato", href: "/contato" },
    { label: "FAQ", href: "/faq" },
    { label: "Entregas", href: "/entregas" },
    { label: "Devolucoes", href: "/devolucoes" },
  ],
  sobre: [
    { label: "Quem somos", href: "/sobre" },
    { label: "Privacidade", href: "/privacidade" },
    { label: "Termos de uso", href: "/termos" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-[1280px] px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="text-lg font-semibold text-ink">
              Economizei
            </Link>
            <p className="mt-2 text-sm text-steel">
              Sua loja online de confianca.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-ink">Navegar</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.navegar.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-steel hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-ink">Ajuda</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.ajuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-steel hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-ink">Sobre</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.sobre.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-steel hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline-soft pt-6 text-center text-sm text-steel">
          &copy; {new Date().getFullYear()} Economizei. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
