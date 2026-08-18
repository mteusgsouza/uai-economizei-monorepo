/**
 * Comandos de edição aplicados ao documento do iframe.
 *
 * Usam `document.execCommand`: apesar de marcado como deprecated, é a única API
 * padronizada que edita HTML arbitrário preservando o markup existente, e segue
 * suportada em todos os navegadores. Concentrar tudo aqui deixa a troca de motor
 * restrita a um arquivo, se um dia for necessária.
 */

export type EditorCommand = (doc: Document) => void

export function exec(command: string, argument?: string): EditorCommand {
  return (doc) => {
    doc.defaultView?.focus()
    doc.execCommand(command, false, argument)
  }
}

/** `formatBlock` exige a tag entre <> em alguns navegadores. */
export function formatBlock(tag: string): EditorCommand {
  return exec('formatBlock', `<${tag}>`)
}

export function saveRange(doc: Document | null): Range | null {
  const selection = doc?.getSelection()
  return selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null
}

export function restoreRange(doc: Document, range: Range | null): void {
  if (!range) return
  const selection = doc.getSelection()
  if (!selection) return
  selection.removeAllRanges()
  selection.addRange(range)
  doc.defaultView?.focus()
}

export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Cor exige styleWithCSS ligado, senão o navegador emite <font color>. */
export function applyColor(doc: Document, color: string): void {
  doc.defaultView?.focus()
  doc.execCommand('styleWithCSS', false, 'true')
  doc.execCommand('foreColor', false, color)
  doc.execCommand('styleWithCSS', false, 'false')
}

/**
 * Tabela via insertHTML: não existe comando nativo, e inserir manipulando o DOM
 * ficaria fora da pilha de desfazer do navegador.
 */
export function insertTable(doc: Document, rows: number, cols: number): void {
  const cell = '<td style="border:1px solid #ccc;padding:6px">&nbsp;</td>'
  const body = Array.from({ length: rows }, () => `<tr>${cell.repeat(cols)}</tr>`).join('')
  doc.defaultView?.focus()
  doc.execCommand(
    'insertHTML',
    false,
    `<table style="border-collapse:collapse;width:100%"><tbody>${body}</tbody></table><p><br></p>`,
  )
}

export function applyLink(doc: Document, range: Range | null, url: string, text: string): void {
  restoreRange(doc, range)
  const selection = doc.getSelection()
  if (selection && !selection.isCollapsed) {
    doc.execCommand('createLink', false, url)
    return
  }
  // createLink não faz nada com o cursor sem seleção
  doc.execCommand(
    'insertHTML',
    false,
    `<a href="${escapeAttr(url)}">${escapeText(text || url)}</a>`,
  )
}

export function imageHtml(url: string, alt: string): string {
  return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}">`
}

export function applyImage(doc: Document, range: Range | null, url: string, alt: string): void {
  restoreRange(doc, range)
  doc.execCommand('insertHTML', false, imageHtml(url, alt))
}

/**
 * Marca o lugar onde uma imagem colada/solta está subindo, pra dar feedback
 * antes do upload terminar. `replacePlaceholder` troca pelo `<img>` real (ou
 * por uma mensagem de erro) quando a promise resolve.
 */
export function insertUploadPlaceholder(doc: Document, id: string): void {
  doc.execCommand(
    'insertHTML',
    false,
    `<span data-uploading="${id}" class="uai-html-editor-uploading">Enviando imagem…</span>`,
  )
}

export function replaceUploadPlaceholder(doc: Document, id: string, html: string): void {
  const el = doc.querySelector(`[data-uploading="${id}"]`)
  if (el) el.outerHTML = html
}
