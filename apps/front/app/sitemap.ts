import { getPayload } from 'payload'
import config from '@payload-config'
import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [posts, pages] = await Promise.all([
    payload.find({ collection: 'posts', where: { status: { equals: 'published' } } }),
    payload.find({ collection: 'pages' }),
  ])

  const postEntries: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const pageEntries: MetadataRoute.Sitemap = pages.docs
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
