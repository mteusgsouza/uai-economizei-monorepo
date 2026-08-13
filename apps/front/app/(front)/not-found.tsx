import Link from 'next/link'

import { SiteShell } from '@/components/layout/site-shell'

/**
 * Cobre os `notFound()` chamados em runtime — produto inexistente, por exemplo.
 * Rotas com `dynamicParams = false` (páginas do CMS e posts) não passam por
 * aqui: o Next recusa o param antes de montar a árvore e serve o 404 embutido.
 */
export default function NotFound() {
  return (
    <SiteShell mainClassName="py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-8 text-center">
        <p className="font-heading text-sm font-medium tracking-wide text-steel">404</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink md:text-4xl">
          Página não encontrada
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-steel">
          O endereço que você abriu não existe ou saiu do ar.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-brand-green-deep px-6 py-3 font-medium text-on-dark transition-colors hover:bg-brand-green"
        >
          Voltar para a home
        </Link>
      </div>
    </SiteShell>
  )
}
