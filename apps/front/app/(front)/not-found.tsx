import Link from 'next/link'

import { SiteShell } from '@/components/layout/site-shell'

/**
 * Cobre os `notFound()` chamados em runtime — produto ou página do CMS
 * inexistente, por exemplo. Rotas com `dynamicParams = false` (posts) não passam
 * por aqui: o Next recusa o param antes de montar a árvore e serve o 404 embutido.
 *
 * O status só sai 404 se o `notFound()` acontecer fora de qualquer Suspense —
 * dentro de um, o shell já foi enviado com 200 e o Next só consegue acrescentar
 * `noindex`. Por isso não há `loading.tsx` na raiz do grupo, e um `loading.tsx`
 * nunca deve ficar acima de uma rota que chama `notFound()`. Quando a rota
 * precisa de esqueleto, a checagem de existência vai para o `layout.tsx` do
 * segmento, como em `produtos/[id]`.
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
