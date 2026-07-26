'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DEBOUNCE_MS = 400

interface UseEditorDocArgs {
  value: string
  onChange: (html: string) => void
  locked: boolean
}

export interface EditorDoc {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  /** Documento do iframe, ou null enquanto não carregou. */
  getDoc: () => Document | null
  /** Liga o documento ao valor atual — chamar no onLoad do iframe. */
  attach: () => void
  /** Grava as edições pendentes imediatamente. */
  flush: () => void
  ready: boolean
}

/**
 * Fiação entre o documento editável do iframe e o valor do campo.
 *
 * Regra central: montar não escreve. Só um evento `input` real marca o conteúdo
 * como sujo, então abrir e salvar um produto sem editar mantém o HTML idêntico
 * — importante porque o navegador normaliza levemente o markup ao serializar.
 */
export function useEditorDoc({ value, onChange, locked }: UseEditorDocArgs): EditorDoc {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const lastValueRef = useRef<string | null>(null)
  const dirtyRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const [ready, setReady] = useState(false)

  const getDoc = useCallback(() => iframeRef.current?.contentDocument ?? null, [])

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!dirtyRef.current || locked) return

    const doc = getDoc()
    if (!doc?.body) return

    dirtyRef.current = false
    const html = doc.body.innerHTML
    if (html === lastValueRef.current) return

    lastValueRef.current = html
    onChange(html)
  }, [getDoc, locked, onChange])

  const schedule = useCallback(() => {
    dirtyRef.current = true
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(flush, DEBOUNCE_MS)
  }, [flush])

  const attach = useCallback(() => {
    const doc = getDoc()
    if (!doc?.body || doc.readyState !== 'complete') return

    doc.body.innerHTML = value ?? ''
    lastValueRef.current = value ?? ''
    dirtyRef.current = false

    doc.body.contentEditable = locked ? 'false' : 'true'
    // Enter gera <p> e negrito gera <b> em vez de <span style>
    doc.execCommand('defaultParagraphSeparator', false, 'p')
    doc.execCommand('styleWithCSS', false, 'false')
    doc.execCommand('enableObjectResizing', false, 'false')

    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na carga do iframe
  }, [getDoc, locked])

  // Listeners de edição
  useEffect(() => {
    const doc = getDoc()
    if (!ready || !doc) return

    doc.addEventListener('input', schedule)
    doc.addEventListener('blur', flush, true)
    return () => {
      doc.removeEventListener('input', schedule)
      doc.removeEventListener('blur', flush, true)
      flush()
    }
  }, [ready, getDoc, schedule, flush])

  // Valor alterado por fora (aba HTML) — reinjeta sem mexer no cursor de quem digita
  useEffect(() => {
    const doc = getDoc()
    if (!ready || !doc?.body) return
    if (value === lastValueRef.current) return

    doc.body.innerHTML = value ?? ''
    lastValueRef.current = value ?? ''
    dirtyRef.current = false
  }, [value, ready, getDoc])

  // Reflete mudança de permissão sem remontar
  useEffect(() => {
    const doc = getDoc()
    if (!ready || !doc?.body) return
    doc.body.contentEditable = locked ? 'false' : 'true'
  }, [locked, ready, getDoc])

  return { iframeRef, getDoc, attach, flush, ready }
}
