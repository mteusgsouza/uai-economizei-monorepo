import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Page } from '@/payload-types'
import { PageBlocks } from '@/components/cms/page-blocks'
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

/** Teto explícito: são páginas institucionais, não uma tabela para varrer. */
const MAX_PAGES = 200

// Prerender no build. São poucas páginas e mudam raramente, então servir
// estático evita gastar Serverless Function (limite de 12 no plano Hobby).
// Contrapartida: página nova no admin só aparece após um novo deploy.
export const dynamicParams = false

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    limit: MAX_PAGES,
    select: { slug: true },
  })

  return docs
    .map((page) => ({ slug: page.slug as string }))
    .filter(({ slug }) => slug && !RESERVED_ROUTES.includes(slug))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const page = docs[0]
  if (!page) return { title: 'Página não encontrada' }

  return {
    title: page.title as string,
  }
}

export default async function DynamicPage({ params }: Args) {
  const { slug } = await params

  // Ignora rotas que são tratadas por outras páginas
  if (RESERVED_ROUTES.includes(slug)) notFound()

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const page = docs[0]
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
