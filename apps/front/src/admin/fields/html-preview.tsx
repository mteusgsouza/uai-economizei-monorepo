'use client'

import { useState } from 'react'
import { useField } from '@payloadcms/ui'

/**
 * Pré-visualização do HTML colado na descrição do produto.
 * Renderiza dentro de um iframe com sandbox para que o CSS e os scripts
 * do HTML colado não vazem para o admin.
 */
export function HtmlPreview({ path }: { path: string }) {
  const { value } = useField<string>({ path })
  const [open, setOpen] = useState(false)

  const html = typeof value === 'string' ? value.trim() : ''
  if (!html) return null

  return (
    <div className="uai-html-preview">
      <button type="button" className="uai-preview-toggle" onClick={() => setOpen(!open)}>
        {open ? 'Ocultar pré-visualização' : 'Ver pré-visualização'}
      </button>

      {open && (
        <iframe
          className="uai-preview-frame"
          sandbox=""
          title="Pré-visualização da descrição"
          srcDoc={`<!doctype html><meta charset="utf-8"><base target="_blank"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#111;background:#fff}img{max-width:100%;height:auto}</style>${html}`}
        />
      )}
    </div>
  )
}

export default HtmlPreview
