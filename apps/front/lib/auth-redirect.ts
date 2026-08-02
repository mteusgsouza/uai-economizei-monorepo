export const DEFAULT_REDIRECT = "/";
export const REDIRECT_PARAM = "redirect";

/**
 * Aceita apenas caminhos internos.
 *
 * Sem essa checagem o parâmetro viraria redirecionamento aberto: bastaria
 * mandar `?redirect=https://site-falso` para usar o nosso login como trampolim.
 * `//host` também é rejeitado — o navegador trata como URL absoluta.
 */
export function safeRedirect(value: string | null | undefined): string {
  if (!value) return DEFAULT_REDIRECT;

  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return DEFAULT_REDIRECT;
  if (path.includes("\\")) return DEFAULT_REDIRECT;

  return path;
}

/** Monta o link de login (ou cadastro) preservando para onde a pessoa ia. */
export function withRedirect(authPath: string, target?: string | null): string {
  const destination = safeRedirect(target);
  if (destination === DEFAULT_REDIRECT) return authPath;
  return `${authPath}?${REDIRECT_PARAM}=${encodeURIComponent(destination)}`;
}
