'use client'

import { useCallback, useRef, useState } from 'react'
import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import type { CodeFieldClientComponent } from 'payload'

import { HtmlSource } from './html-source'
import { PreviewPane } from './preview-pane'
import { VisualEditor, type VisualEditorHandle } from './visual-editor'

type Tab = 'visual' | 'html' | 'preview'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'visual', label: 'Visual' },
  { id: 'html', label: 'HTML' },
  { id: 'preview', label: 'Pré-visualização' },
]

/**
 * Campo de descrição do produto.
 *
 * A aba visual edita o HTML preservando o markup existente; a aba HTML serve
 * para colar código pronto. Cada aba desmonta ao sair — manter o iframe oculto
 * faria o Chrome recarregá-lo, perdendo o conteúdo injetado.
 */
export const HtmlEditorField: CodeFieldClientComponent = ({ field, readOnly }) => {
  const { value, setValue, showError, errorMessage, disabled, customComponents } =
    useField<string>()
  const [tab, setTab] = useState<Tab>('visual')
  const visualRef = useRef<VisualEditorHandle>(null)

  const locked = Boolean(readOnly) || Boolean(disabled)
  const html = value ?? ''

  const handleChange = useCallback(
    (next: string) => {
      if (locked) return
      setValue(next.length > 0 ? next : null)
    },
    [locked, setValue],
  )

  const changeTab = (next: Tab) => {
    // Grava o que estiver pendente antes de desmontar o editor visual
    if (tab === 'visual') visualRef.current?.flush()
    setTab(next)
  }

  return (
    <div className="uai-html-editor field-type">
      <FieldLabel label={field?.label} required={field?.required} />

      <div className="uai-toggle-group uai-html-editor-tabs">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="uai-toggle"
            data-active={tab === id}
            onClick={() => changeTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {customComponents?.BeforeInput}

      {tab === 'visual' && (
        <VisualEditor ref={visualRef} value={html} onChange={handleChange} locked={locked} />
      )}
      {tab === 'html' && <HtmlSource value={html} onChange={handleChange} locked={locked} />}
      {tab === 'preview' && <PreviewPane html={html} />}

      {customComponents?.AfterInput}

      <FieldError showError={showError} message={errorMessage} />
      <FieldDescription description={field?.admin?.description} path={field?.name ?? ''} />
    </div>
  )
}

export default HtmlEditorField
