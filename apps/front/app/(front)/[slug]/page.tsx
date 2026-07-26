import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Page } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
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
  const reservedRoutes = [
    'posts', 'login', 'register', 'forgot-password', 'reset-password',
    'carrinho', 'produtos', 'categorias', 'marcas', 'mais-vendidos',
    'novidades', 'wishlist', 'admin',
  ]
  if (reservedRoutes.includes(slug)) notFound()

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const page = docs[0]
  if (!page) notFound()

  type LayoutBlock = NonNullable<Page['layout']>[number]

  function renderBlock(block: LayoutBlock) {
    switch (block.blockType) {
      case 'hero':
        return (
          <section className="relative flex min-h-[400px] items-center justify-center bg-muted">
            <div className="text-center">
              <h1 className="mb-4 font-heading text-5xl font-bold">{block.heading}</h1>
              {block.subtext && <p className="text-xl text-muted-foreground">{block.subtext}</p>}
              {block.ctaText && (
                <a href={block.ctaLink ?? '#'} className="mt-6 inline-block rounded bg-primary px-6 py-3 text-primary-foreground">
                  {block.ctaText}
                </a>
              )}
            </div>
          </section>
        )
      case 'content':
        return (
          <section className="mx-auto max-w-3xl px-4 py-12">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(block.body) }}
            />
          </section>
        )
      case 'product-grid':
        return (
          <section className="px-4 py-12">
            {block.title && <h2 className="mb-8 text-center font-heading text-3xl font-bold">{block.title}</h2>}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {block.productIds?.map((item, i) => (
                <div key={i} className="rounded border p-4 text-center">
                  Produto: {item.productId}
                </div>
              ))}
            </div>
          </section>
        )
      case 'cta': {
        const styleClasses: Record<string, string> = {
          primary: 'bg-primary text-primary-foreground',
          secondary: 'bg-secondary text-secondary-foreground',
          outline: 'border-2 border-primary text-primary',
        }
        return (
          <section className={`mx-auto max-w-2xl rounded-xl px-8 py-12 text-center ${styleClasses[block.style ?? 'primary'] ?? styleClasses.primary}`}>
            <h2 className="mb-4 font-heading text-3xl font-bold">{block.heading}</h2>
            {block.body && <p className="mb-6">{block.body}</p>}
            <a href={block.buttonLink ?? '#'} className="inline-block rounded bg-background px-6 py-3 font-semibold text-foreground">
              {block.buttonText}
            </a>
          </section>
        )
      }
      case 'faq':
        return (
          <section className="mx-auto max-w-3xl px-4 py-12">
            {block.title && <h2 className="mb-8 text-center font-heading text-3xl font-bold">{block.title}</h2>}
            <dl className="space-y-4">
              {block.questions?.map((item, i) => (
                <details key={i} className="rounded border p-4">
                  <summary className="cursor-pointer font-semibold">{item.question}</summary>
                  <div
                    className="mt-3 text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(item.answer) }}
                  />
                </details>
              ))}
            </dl>
          </section>
        )
    }
  }

  const layout = page.layout

  return (
    <main>
      {layout?.map((block, i) => (
        <div key={i}>{renderBlock(block)}</div>
      ))}
    </main>
  )
}
