import { getPayload } from 'payload'
import config from '@payload-config'
import type { MetadataRoute } from 'next'

import { getPageIndex } from '@/lib/catalog/pages'
import { SITE_URL } from '@/lib/site'

// ISR em vez de estático: a Vercel serve rota estática como arquivo e a tag
// `pages` nunca chega nela — o sitemap só mudava no deploy seguinte (no
// `next start` local funcionava, o que escondia o problema). A hora é rede de
// segurança; o normal é ser refeito na hora pela tag ao salvar uma página.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  // As páginas vêm pela tag `pages`: salvar uma no admin refaz o sitemap.
  const [posts, pages] = await Promise.all([
    payload.find({ collection: 'posts', where: { status: { equals: 'published' } } }),
    getPageIndex(),
  ])

  const postEntries: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.slug !== 'home')
    .map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/produtos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categorias`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/marcas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...postEntries,
    ...pageEntries,
  ]
}
