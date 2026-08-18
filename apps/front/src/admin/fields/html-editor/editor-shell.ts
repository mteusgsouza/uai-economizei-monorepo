/**
 * Documento base do iframe de edição.
 *
 * Só este shell passa pelo parser de documento (via srcDoc) — o HTML do usuário
 * é injetado depois por innerHTML, o que torna qualquer <script> inerte por
 * especificação. A CSP abaixo é a segunda barreira: bloqueia scripts, fetch e
 * iframes de terceiros dentro do admin, mas libera imagens e o CSS inline que
 * acompanha as descrições dos fabricantes.
 */
export const EDITOR_SHELL = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src * data: blob:; style-src 'unsafe-inline' https: http:; font-src * data:; media-src *; frame-src 'none'">
<style>
  html, body { margin: 0; padding: 12px; box-sizing: border-box; }
  body { font: 14px/1.5 system-ui, sans-serif; color: #111; background: #fff; min-height: 100%; }
  body:focus { outline: none; }
  img { max-width: 100%; height: auto; }
  table { border-collapse: collapse; }
  /* Estado transitório enquanto uma imagem colada/solta sobe pro Media. */
  [data-uploading] { display: inline-block; padding: 2px 8px; color: #6b7280; font-style: italic; }
  .uai-html-editor-upload-error { display: inline-block; padding: 2px 8px; color: #b91c1c; }
</style></head><body></body></html>`

/** Cores da paleta do seletor de cor da toolbar. */
export const PALETTE = [
  { value: '#111111', label: 'Preto' },
  { value: '#6b7280', label: 'Cinza' },
  { value: '#b91c1c', label: 'Vermelho' },
  { value: '#c2410c', label: 'Laranja' },
  { value: '#15803d', label: 'Verde' },
  { value: '#0369a1', label: 'Azul' },
  { value: '#6d28d9', label: 'Roxo' },
  { value: '#a16207', label: 'Dourado' },
] as const

/**
 * Detecta HTML que traz documento completo. Editar no modo visual descarta as
 * tags-invólucro (o conteúdo interno sobrevive), então avisamos antes.
 */
export function hasFullDocument(html: string): boolean {
  return /<\s*(html|body|!doctype)\b/i.test(html)
}
