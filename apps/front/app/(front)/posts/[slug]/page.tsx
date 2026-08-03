import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Args = {
  params: Promise<{ slug: string }>
}

/** Teto explícito em vez de varrer a coleção inteira. */
const MAX_POSTS = 500

// Prerender no build: posts mudam pouco e servir estático evita gastar
// Serverless Function (limite de 12 no plano Hobby). Só entram os publicados
// — mesmo critério do sitemap —, então rascunho deixa de ser acessível por URL
// direta. Contrapartida: post novo só aparece após um novo deploy.
export const dynamicParams = false

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: MAX_POSTS,
    select: { slug: true },
  })

  return docs
    .filter((post) => post.slug)
    .map((post) => ({ slug: post.slug as string }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = docs[0]
  if (!post) return { title: 'Post não encontrado' }

  return {
    title: String(post.title),
    description: post.excerpt ?? undefined,
  }
}

export default async function PostPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = docs[0]
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="mb-4 font-heading text-4xl font-bold">{String(post.title)}</h1>
        {post.excerpt && (
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>
        )}
        {post.publishedAt && (
          <time className="text-sm text-muted-foreground" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
          </time>
        )}
      </header>

      {post.content && (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.content) }}
        />
      )}
    </article>
  )
}
