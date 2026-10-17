import type { Endpoint } from 'payload'

import { buildSitemapEntries, renderSitemap } from '../../lib/seo/sitemap'
import { SITE_URL } from '../../lib/site'

/**
 * Servido em `/sitemap.xml` por um rewrite do `next.config.mjs`. Mora dentro da
 * função do REST do Payload (`/api/[...slug]`) porque uma rota própria gastaria
 * mais uma das 12 Serverless Functions do plano Hobby da Vercel.
 *
 * Lê o banco a cada pedido que passa pela CDN: o `s-maxage` segura a carga e é
 * o teto de quanto uma página salva no admin demora a aparecer no sitemap. Não
 * depende de revalidação por tag — foi justamente o que a Vercel ignorou no
 * `app/sitemap.ts`, servido como arquivo do build.
 */
const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'

export const sitemapEndpoint: Endpoint = {
  path: '/sitemap.xml',
  method: 'get',
  handler: async (req) => {
    const [posts, pages] = await Promise.all([
      req.payload.find({
        collection: 'posts',
        where: { status: { equals: 'published' } },
        select: { slug: true, updatedAt: true },
        depth: 0,
        pagination: false,
      }),
      req.payload.find({
        collection: 'pages',
        select: { slug: true, updatedAt: true },
        depth: 0,
        pagination: false,
      }),
    ])

    const entries = buildSitemapEntries({
      siteUrl: SITE_URL,
      posts: posts.docs,
      pages: pages.docs,
      now: new Date(),
    })

    return new Response(renderSitemap(entries), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': CACHE_CONTROL,
      },
    })
  },
}
