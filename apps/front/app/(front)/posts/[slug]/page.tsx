import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@/components/rich-text'

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
    <article className="mx-auto max-w-3xl px-8">
      <header className="mb-8">
        <h1 className="mb-4 font-heading text-3xl font-semibold leading-tight tracking-[-0.005em] text-ink md:text-4xl">
          {String(post.title)}
        </h1>
        {post.excerpt && (
          <p className="text-lg leading-relaxed text-steel">{post.excerpt}</p>
        )}
        {post.publishedAt && (
          <time className="text-sm text-stone" dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
          </time>
        )}
      </header>

      {post.content && <RichText data={post.content} />}
    </article>
  )
}
