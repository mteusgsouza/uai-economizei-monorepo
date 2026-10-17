const VIDEO_ID = /^[\w-]{11}$/;
const PATH_KINDS = ["shorts", "embed", "live"];

/**
 * Id do vídeo num link do YouTube — watch, youtu.be, shorts, embed e live.
 * `null` para qualquer outra coisa: é o que o admin usa para recusar o link e
 * o site para não montar um player quebrado.
 */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(www|m)\./, "");
  const [, first = "", second = ""] = parsed.pathname.split("/");
  let id: string | null = null;

  if (host === "youtu.be") id = first;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = first === "watch" ? parsed.searchParams.get("v") : PATH_KINDS.includes(first) ? second : null;
  }

  return id && VIDEO_ID.test(id) ? id : null;
}

/** Player sem cookie de rastreio até o play — combina com o aviso de cookies. */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
