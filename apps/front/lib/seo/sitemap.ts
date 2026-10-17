/**
 * O `/sitemap.xml` da loja, montado aqui em vez de pela metadata route do Next:
 * na Vercel o `app/sitemap.ts` virava arquivo fixo do build — nem
 * `revalidateTag` nem `revalidatePath` o refaziam — e página criada no admin só
 * entrava no sitemap no deploy seguinte. Quem serve é o endpoint do Payload em
 * `src/endpoints/sitemap.ts`.
 *
 * Sem dependência de ambiente nem de banco: recebe os documentos e devolve o
 * XML, para dar para testar.
 */

import type { Page, Post } from "@/payload-types";

export type ChangeFrequency = "daily" | "weekly" | "monthly";

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

export type SitemapDoc = Pick<Page | Post, "slug" | "updatedAt">;

export interface SitemapSources {
  siteUrl: string;
  posts: readonly SitemapDoc[];
  pages: readonly SitemapDoc[];
  now: Date;
}

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char] ?? char);
}

function isoDate(value: string | Date): string {
  return new Date(value).toISOString();
}

export function buildSitemapEntries({ siteUrl, posts, pages, now }: SitemapSources): SitemapEntry[] {
  const today = isoDate(now);

  const postEntries = posts.map(
    (post): SitemapEntry => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: isoDate(post.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  // `home` é a própria raiz do site, já listada abaixo.
  const pageEntries = pages
    .filter((page) => page.slug !== "home")
    .map(
      (page): SitemapEntry => ({
        url: `${siteUrl}/${page.slug}`,
        lastModified: isoDate(page.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
      })
    );

  return [
    { url: siteUrl, lastModified: today, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/produtos`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categorias`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/marcas`, lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    ...postEntries,
    ...pageEntries,
  ];
}

export function renderSitemap(entries: readonly SitemapEntry[]): string {
  const urls = entries.map((entry) =>
    [
      "<url>",
      `<loc>${escapeXml(entry.url)}</loc>`,
      `<lastmod>${entry.lastModified}</lastmod>`,
      `<changefreq>${entry.changeFrequency}</changefreq>`,
      `<priority>${entry.priority}</priority>`,
      "</url>",
    ].join("\n")
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}
