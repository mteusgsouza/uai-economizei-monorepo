/**
 * Identidade do site para quem lê de fora: buscador, robô de rede social,
 * sitemap. O endereço precisa ser absoluto — `og:image` e `canonical` relativos
 * são ignorados por praticamente todo crawler.
 */

export const SITE_NAME = "UAI Economizei";

/**
 * `NEXT_PUBLIC_SITE_URL` manda — é o único que sabe de domínio próprio. Sem
 * ele, o domínio de produção que a própria Vercel injeta serve de rede: melhor
 * um endereço certo por padrão do que `canonical` e `og:url` apontando para
 * localhost, que foi o que aconteceu com o robots.txt em produção.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

/**
 * Aceita tanto a URL completa de um host externo (catálogo antigo no Firebase)
 * quanto o caminho relativo que o Payload devolve para o que subimos
 * (`/api/media/file/...`), e sempre entrega algo absoluto.
 */
export function absoluteUrl(pathOrUrl: string): string {
  const value = pathOrUrl.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}
