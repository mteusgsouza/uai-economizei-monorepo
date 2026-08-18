'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { imageHtml, insertUploadPlaceholder, replaceUploadPlaceholder } from './commands'
import { uploadImage } from './upload'

const DEBOUNCE_MS = 400

let uploadCounter = 0

/** Primeiro arquivo de imagem colado do clipboard. */
function firstImageFromClipboard(items: DataTransferItemList | null | undefined): File | null {
  if (!items) return null
  for (const item of Array.from(items)) {
    const file = item.kind === 'file' ? item.getAsFile() : null
    if (file && file.type.startsWith('image/')) return file
  }
  return null
}

/** Primeiro arquivo de imagem solto (drag and drop). */
function firstImageFromFileList(files: FileList | null | undefined): File | null {
  if (!files) return null
  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) return file
  }
  return null
}

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

  // Sobe o arquivo e troca o placeholder pela <img> (ou por um aviso de erro)
  // quando a promise resolve — pode terminar bem depois do usuário ter seguido
  // digitando, então busca o documento de novo em vez de reusar `doc`.
  const uploadAndInsert = useCallback(
    (file: File) => {
      const id = `up-${Date.now()}-${uploadCounter++}`
      const doc = getDoc()
      if (!doc) return
      insertUploadPlaceholder(doc, id)
      schedule()

      uploadImage(file)
        .then(({ url, alt }) => {
          const d = getDoc()
          if (d) replaceUploadPlaceholder(d, id, imageHtml(url, alt))
        })
        .catch(() => {
          const d = getDoc()
          if (d) {
            replaceUploadPlaceholder(
              d,
              id,
              '<span class="uai-html-editor-upload-error">Falha ao enviar a imagem</span>',
            )
          }
        })
        .finally(schedule)
    },
    [getDoc, schedule],
  )

  // Cola imagem (print, copiar de outra aba) sem virar base64 no HTML — sobe
  // pro Media e insere só a URL. Texto colado segue o caminho padrão do navegador.
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const file = firstImageFromClipboard(e.clipboardData?.items)
      if (!file) return
      e.preventDefault()
      uploadAndInsert(file)
    },
    [uploadAndInsert],
  )

  // Soltar um arquivo de imagem (Explorer/Finder) tem o mesmo problema do
  // paste — sem isso o navegador injeta um data: URI.
  const handleDrop = useCallback(
    (e: DragEvent) => {
      const file = firstImageFromFileList(e.dataTransfer?.files)
      if (!file) return
      e.preventDefault()

      const doc = getDoc()
      const caret = doc?.caretRangeFromPoint?.(e.clientX, e.clientY)
      if (doc && caret) {
        const selection = doc.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(caret)
      }
      uploadAndInsert(file)
    },
    [getDoc, uploadAndInsert],
  )

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
    doc.addEventListener('paste', handlePaste)
    doc.addEventListener('drop', handleDrop)
    return () => {
      doc.removeEventListener('input', schedule)
      doc.removeEventListener('blur', flush, true)
      doc.removeEventListener('paste', handlePaste)
      doc.removeEventListener('drop', handleDrop)
      flush()
    }
  }, [ready, getDoc, schedule, flush, handlePaste, handleDrop])

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
