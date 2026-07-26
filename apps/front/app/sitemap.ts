import { getPayload } from 'payload'
import config from '@payload-config'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const [posts, pages] = await Promise.all([
    payload.find({ collection: 'posts', where: { status: { equals: 'published' } } }),
    payload.find({ collection: 'pages' }),
  ])

  const postEntries: MetadataRoute.Sitemap = posts.docs.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const pageEntries: MetadataRoute.Sitemap = pages.docs
    .filter((page) => page.slug !== 'home')
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/produtos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/marcas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...postEntries,
    ...pageEntries,
  ]
}
