import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSitemapEntries, renderSitemap } from "./sitemap";

const NOW = new Date("2026-10-17T12:00:00.000Z");

const sources = {
  siteUrl: "https://loja.test",
  posts: [{ slug: "dicas", updatedAt: "2026-10-01T10:00:00.000Z" }],
  pages: [
    { slug: "home", updatedAt: "2026-10-02T10:00:00.000Z" },
    { slug: "sobre", updatedAt: "2026-10-03T10:00:00.000Z" },
  ],
  now: NOW,
};

describe("entradas do sitemap", () => {
  it("lista as rotas fixas antes de posts e páginas", () => {
    const urls = buildSitemapEntries(sources).map((entry) => entry.url);
    assert.deepEqual(urls, [
      "https://loja.test",
      "https://loja.test/produtos",
      "https://loja.test/categorias",
      "https://loja.test/marcas",
      "https://loja.test/posts/dicas",
      "https://loja.test/sobre",
    ]);
  });

  it("deixa a página home de fora — ela é a raiz", () => {
    const urls = buildSitemapEntries(sources).map((entry) => entry.url);
    assert.ok(!urls.includes("https://loja.test/home"));
  });

  it("usa o updatedAt do documento como lastmod", () => {
    const sobre = buildSitemapEntries(sources).find((entry) => entry.url.endsWith("/sobre"));
    assert.equal(sobre?.lastModified, "2026-10-03T10:00:00.000Z");
  });

  it("dá às rotas fixas a hora da geração", () => {
    const [root] = buildSitemapEntries(sources);
    assert.equal(root?.lastModified, NOW.toISOString());
  });
});

describe("XML do sitemap", () => {
  it("segue o protocolo sitemaps.org", () => {
    const xml = renderSitemap(buildSitemapEntries(sources));
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.match(xml, /<url>\n<loc>https:\/\/loja\.test\/sobre<\/loc>\n<lastmod>2026-10-03T10:00:00\.000Z<\/lastmod>/);
    assert.equal(xml.match(/<url>/g)?.length, 6);
  });

  it("escapa caracteres especiais do endereço", () => {
    const xml = renderSitemap([
      { url: "https://loja.test/a?b=1&c=<2>", lastModified: NOW.toISOString(), changeFrequency: "daily", priority: 1 },
    ]);
    assert.match(xml, /<loc>https:\/\/loja\.test\/a\?b=1&amp;c=&lt;2&gt;<\/loc>/);
  });
});
