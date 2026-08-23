/**
 * O que a página do produto conta para fora: título, descrição, prévia em rede
 * social e os dados estruturados que o Google lê para montar o resultado rico
 * (preço, estoque, marca).
 *
 * Vive fora da página porque são duas saídas da mesma informação — `<meta>` e
 * JSON-LD — e elas precisam concordar: preço divergente entre a marcação e o
 * que a página mostra é motivo de penalização no Merchant Center.
 */

import type { Metadata } from "next";

import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import type { Product } from "@/types/product";

/** Limite prático antes de o Google truncar a descrição no resultado. */
const DESCRIPTION_LIMIT = 160;

/** Quantas figuras vão para a prévia; o resto só interessa ao JSON-LD. */
const PREVIEW_IMAGES = 4;

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** A descrição do produto é HTML; `<meta>` e JSON-LD só aceitam texto. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

/** Corta na palavra: descrição terminada no meio de uma delas parece defeito. */
function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function productUrl(product: Product): string {
  return `${SITE_URL}/produtos/${product.id}`;
}

/**
 * Sem descrição cadastrada, um texto neutro — nada de prometer prazo, frete ou
 * condição que a loja talvez não pratique.
 */
export function productDescription(product: Product): string {
  const text = plainText(product.description_html ?? "");
  if (text) return truncate(text, DESCRIPTION_LIMIT);
  return `Compre ${product.name} na ${SITE_NAME}. Veja preço, formas de pagamento e disponibilidade.`;
}

function productImages(product: Product): string[] {
  const urls = [product.productMainImg, ...product.productImages.map((img) => img.url)]
    .filter(Boolean)
    .map(absoluteUrl)
    .filter(Boolean);
  return [...new Set(urls)];
}

export function productMetadata(product: Product): Metadata {
  const url = productUrl(product);
  const description = productDescription(product);
  const images = productImages(product).slice(0, PREVIEW_IMAGES);

  return {
    // O nome da loja no fim porque o buscador corta pela direita — o que
    // identifica o resultado é o produto.
    title: `${product.name} — ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "pt_BR",
      url,
      title: product.name,
      description,
      images: images.map((image) => ({ url: image, alt: product.name })),
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images,
    },
  };
}

export function productJsonLd(product: Product): Record<string, unknown> {
  const images = productImages(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription(product),
    sku: String(product.id),
    ...(images.length > 0 && { image: images }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand.name } }),
    ...(product.category && { category: product.category.title }),
    offers: {
      "@type": "Offer",
      url: productUrl(product),
      priceCurrency: "BRL",
      // O catálogo inteiro guarda centavos (ver `lib/commerce.ts`); schema.org
      // espera a moeda. Sem dividir, R$ 220,00 vira 22000 na marcação — preço
      // divergente do que a página mostra é motivo de suspensão no Merchant
      // Center. Duas casas sempre: parte dos validadores lê `19.9` e `19.90`
      // como preços diferentes.
      price: (product.value / 100).toFixed(2),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      // `isNew` aqui é estado de conservação, não novidade de catálogo.
      itemCondition: product.isNew
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}
