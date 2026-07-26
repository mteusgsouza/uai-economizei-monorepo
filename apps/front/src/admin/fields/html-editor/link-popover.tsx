'use client'

import { useState } from 'react'

export interface PopoverSubmit {
  url: string
  text: string
}

interface LinkPopoverProps {
  title: string
  urlLabel: string
  /** Segundo campo: texto do link ou alt da imagem. */
  textLabel: string
  textPlaceholder?: string
  onSubmit: (data: PopoverSubmit) => void
  onCancel: () => void
}

/**
 * Popover de inserção de link e imagem.
 * Substitui `window.prompt`, que bloqueia a thread e não permite dois campos.
 */
export function LinkPopover({
  title,
  urlLabel,
  textLabel,
  textPlaceholder,
  onSubmit,
  onCancel,
}: LinkPopoverProps) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')

  const submit = () => {
    if (!url.trim()) return
    onSubmit({ url: url.trim(), text: text.trim() })
  }

  return (
    <div className="uai-html-editor-popover" role="dialog" aria-label={title}>
      <label className="uai-popover-label">
        {urlLabel}
        <input
          className="uai-popover-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onCancel()
          }}
        />
      </label>

      <label className="uai-popover-label">
        {textLabel}
        <input
          className="uai-popover-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={textPlaceholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onCancel()
          }}
        />
      </label>

      <div className="uai-popover-actions">
        <button type="button" className="uai-toggle" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="uai-toggle" data-active="true" onClick={submit}>
          Inserir
        </button>
      </div>
    </div>
  )
}
