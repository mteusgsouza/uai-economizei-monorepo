/**
 * A convenção de nome dos recortes da Media, num lugar só.
 *
 * O produto guarda a imagem como URL de texto, não como relação — então o site
 * não tem acesso a `sizes.og.url` e precisa deduzir o endereço do recorte a
 * partir do original. Quem gera o nome (a collection) e quem o deduz (o SEO)
 * têm de usar a mesma regra: separadas, a primeira renomeação silenciosa
 * quebraria a prévia de todo link compartilhado, e ninguém veria.
 */

/** Rota pela qual o Payload serve os arquivos, com controle de acesso. */
const MEDIA_FILE_ROUTE = "/api/media/file/";

/** Recorte pensado para prévia em rede social (1200x630). */
export const SOCIAL_SIZE = "og";

export function sizedImageName({
  extension,
  originalName,
  sizeName,
}: {
  extension: string;
  originalName: string;
  sizeName: string;
}): string {
  return `${originalName}-${sizeName}.${extension}`;
}

/**
 * O endereço de um recorte, a partir da URL do original — ou `null` quando a
 * imagem não é nossa (catálogo antigo em host externo), caso em que não existe
 * recorte nenhum para apontar.
 */
export function mediaSizeUrl(url: string, sizeName: string): string | null {
  if (!url.startsWith(MEDIA_FILE_ROUTE)) return null;

  const filename = url.slice(MEDIA_FILE_ROUTE.length);
  const dot = filename.lastIndexOf(".");
  if (dot <= 0) return null;

  return `${MEDIA_FILE_ROUTE}${sizedImageName({
    originalName: filename.slice(0, dot),
    sizeName,
    extension: filename.slice(dot + 1),
  })}`;
}
