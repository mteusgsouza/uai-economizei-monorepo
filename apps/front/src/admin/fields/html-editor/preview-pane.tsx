'use client'

/**
 * Pré-visualização fiel: sem caret, sem CSS do editor e com sandbox total.
 * Diferente da aba visual, aqui o `srcDoc` passa pelo parser de documento, então
 * o sandbox vazio (nenhuma permissão) é o que impede scripts de executarem.
 */
export function PreviewPane({ html }: { html: string }) {
  if (!html.trim()) {
    return <p className="uai-empty">Nada para pré-visualizar.</p>
  }

  return (
    <iframe
      className="uai-html-editor-frame"
      sandbox=""
      title="Pré-visualização da descrição"
      srcDoc={`<!doctype html><meta charset="utf-8"><base target="_blank"><style>body{font:14px/1.5 system-ui,sans-serif;margin:12px;color:#111;background:#fff}img{max-width:100%;height:auto}</style>${html}`}
    />
  )
}
