'use client'

import { useEffect, useImperativeHandle } from 'react'

import { EDITOR_SHELL, hasFullDocument } from './editor-shell'
import { Toolbar } from './toolbar'
import { useEditorDoc } from './use-editor-doc'

export interface VisualEditorHandle {
  /** Grava edições pendentes — usado ao trocar de aba. */
  flush: () => void
}

interface VisualEditorProps {
  value: string
  onChange: (html: string) => void
  locked: boolean
  ref?: React.Ref<VisualEditorHandle>
}

/**
 * Edição visual do HTML dentro de um iframe.
 *
 * O iframe isola o CSS das descrições de fabricante (que trazem <style> e
 * classes próprias) do CSS do admin, e o `sandbox` sem `allow-scripts` impede
 * que handlers inline do conteúdo colado executem.
 */
export function VisualEditor({ value, onChange, locked, ref }: VisualEditorProps) {
  const { iframeRef, getDoc, attach, flush, ready } = useEditorDoc({
    value,
    onChange,
    locked,
  })

  useImperativeHandle(ref, () => ({ flush }), [flush])

  // Cobre o caso de o load do iframe já ter ocorrido antes do listener
  useEffect(() => {
    attach()
  }, [attach])

  return (
    <div className="uai-html-editor-visual">
      <Toolbar getDoc={getDoc} disabled={locked || !ready} />

      {hasFullDocument(value) && (
        <p className="uai-html-editor-warning">
          Este conteúdo tem um documento HTML completo. Editar aqui remove as tags{' '}
          <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code> e <code>&lt;body&gt;</code> —
          o conteúdo interno é preservado. Para mantê-las, use a aba HTML.
        </p>
      )}

      <iframe
        ref={iframeRef}
        className="uai-html-editor-frame"
        title="Editor visual da descrição"
        sandbox="allow-same-origin"
        srcDoc={EDITOR_SHELL}
        onLoad={attach}
      />
    </div>
  )
}
