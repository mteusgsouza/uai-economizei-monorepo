import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Page } from '@/payload-types'
import { PageBlocks } from '@/components/cms/page-blocks'
import { getPage, getPageIndex } from '@/lib/catalog/pages'
import { cn } from '@workspace/ui/lib/utils'

type Args = {
  params: Promise<{ slug: string }>
}

/** O template escolhido no admin manda na largura da coluna de conteúdo. */
const TEMPLATE_CONTAINER: Record<NonNullable<Page['template']>, string> = {
  default: 'max-w-3xl',
  landing: 'max-w-[1280px]',
  faq: 'max-w-3xl',
  contact: 'max-w-2xl',
}

/** Slugs servidos por páginas próprias — nunca caem neste catch-all. */
const RESERVED_ROUTES = [
  'posts', 'login', 'register', 'forgot-password', 'reset-password',
  'carrinho', 'produtos', 'categorias', 'marcas', 'mais-vendidos',
  'novidades', 'wishlist', 'admin',
]

// As páginas que existem no build saem prerenderizadas; um slug novo é
// renderizado no primeiro acesso e entra no mesmo cache (ISR). O hook da
// collection invalida a tag `pages` ao salvar, então o lojista publica sem
// deploy. A rota já era ISR (revalidate de 5 min herdado do layout) e a
// tabela de rotas do build não muda — só o fallback passa a ser bloqueante.
export const dynamicParams = true

export async function generateStaticParams() {
  const pages = await getPageIndex()
  return pages
    .filter(({ slug }) => slug && !RESERVED_ROUTES.includes(slug))
    .map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Página não encontrada' }

  return {
    title: page.title as string,
  }
}

export default async function DynamicPage({ params }: Args) {
  const { slug } = await params

  // Ignora rotas que são tratadas por outras páginas
  if (RESERVED_ROUTES.includes(slug)) notFound()

  const page = await getPage(slug)
  if (!page) notFound()

  const container = TEMPLATE_CONTAINER[page.template ?? 'default']

  // Um hero de abertura já é o título da página — repetir o `title` acima dele
  // duplicaria o texto.
  const opensWithHero = page.layout?.[0]?.blockType === 'hero'

  return (
    <>
      {!opensWithHero && (
        <header className={cn('mx-auto w-full px-8 pt-16', container)}>
          <h1 className="font-heading text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink md:text-4xl">
            {page.title}
          </h1>
        </header>
      )}
      <PageBlocks blocks={page.layout ?? []} container={container} />
    </>
  )
}
