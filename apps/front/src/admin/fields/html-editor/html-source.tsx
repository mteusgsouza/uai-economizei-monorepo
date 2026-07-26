'use client'

import { CodeEditorLazy } from '@payloadcms/ui'

interface HtmlSourceProps {
  value: string
  onChange: (html: string) => void
  locked: boolean
}

/**
 * Aba de código: Monaco, o mesmo editor do campo `code` nativo do Payload.
 *
 * A altura é fixada porque o CodeEditor a calcula pelo número de linhas — e
 * HTML de fabricante costuma vir minificado numa linha só, o que renderizaria
 * uma faixa de 56px.
 */
export function HtmlSource({ value, onChange, locked }: HtmlSourceProps) {
  return (
    <div className="uai-html-editor-source">
      <CodeEditorLazy
        defaultLanguage="html"
        language="html"
        value={value}
        height="55vh"
        readOnly={locked}
        onChange={(next) => onChange(next ?? '')}
      />
    </div>
  )
}
