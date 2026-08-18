'use client'

import { useState } from 'react'
import { IconLink, IconPalette, IconPhoto, IconTable } from '@tabler/icons-react'

import { applyColor, applyImage, applyLink, insertTable, saveRange } from './commands'
import { PALETTE } from './editor-shell'
import { LinkPopover, type PopoverSubmit } from './link-popover'
import { TOOLBAR_GROUPS } from './toolbar-items'
import { uploadImage } from './upload'

type PopoverKind = 'link' | 'image' | 'color' | null

interface ToolbarProps {
  getDoc: () => Document | null
  disabled: boolean
}

/**
 * Barra de formatação do editor visual.
 *
 * `onMouseDown` com preventDefault mantém o foco (e portanto a seleção) dentro
 * do iframe ao clicar num botão — sem isso todo comando agiria sobre nada.
 */
export function Toolbar({ getDoc, disabled }: ToolbarProps) {
  const [popover, setPopover] = useState<PopoverKind>(null)
  const [range, setRange] = useState<Range | null>(null)
  const [uploading, setUploading] = useState(false)

  const openPopover = (kind: PopoverKind) => {
    // A seleção precisa ser guardada antes de o input do popover roubar o foco
    setRange(saveRange(getDoc()))
    setPopover(kind)
  }

  const closePopover = () => setPopover(null)

  const handleSubmit = ({ url, text }: PopoverSubmit) => {
    const doc = getDoc()
    if (doc) {
      if (popover === 'link') applyLink(doc, range, url, text)
      if (popover === 'image') applyImage(doc, range, url, text)
    }
    closePopover()
  }

  // Alternativa a digitar uma URL: sobe o arquivo pro Media e insere o
  // resultado — nunca base64. A seleção guardada na abertura do popover
  // continua valendo porque o input de arquivo não rouba o foco do iframe.
  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const { url, alt } = await uploadImage(file)
      const doc = getDoc()
      if (doc) applyImage(doc, range, url, alt)
      closePopover()
    } catch {
      // Mantém o popover aberto — o usuário tenta de novo ou digita uma URL.
    } finally {
      setUploading(false)
    }
  }

  const extraButton = (kind: Exclude<PopoverKind, null>, title: string, Icon: typeof IconLink) => (
    <button
      key={kind}
      type="button"
      className="uai-icon-button"
      title={title}
      aria-label={title}
      disabled={disabled}
      data-active={popover === kind}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => (popover === kind ? closePopover() : openPopover(kind))}
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div className="uai-html-editor-toolbar">
      {TOOLBAR_GROUPS.map((group, index) => (
        <div className="uai-toolbar-group" key={index}>
          {group.map(({ id, title, Icon, run }) => (
            <button
              key={id}
              type="button"
              className="uai-icon-button"
              title={title}
              aria-label={title}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const doc = getDoc()
                if (doc) run(doc)
              }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      ))}

      <div className="uai-toolbar-group">
        {extraButton('link', 'Inserir link', IconLink)}
        {extraButton('image', 'Inserir imagem', IconPhoto)}
        {extraButton('color', 'Cor do texto', IconPalette)}
        <button
          type="button"
          className="uai-icon-button"
          title="Inserir tabela 3x3"
          aria-label="Inserir tabela 3x3"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const doc = getDoc()
            if (doc) insertTable(doc, 3, 3)
          }}
        >
          <IconTable size={18} />
        </button>
      </div>

      {popover === 'color' && (
        <div className="uai-color-palette" role="group" aria-label="Cor do texto">
          {PALETTE.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className="uai-color-swatch"
              style={{ background: value }}
              title={label}
              aria-label={label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const doc = getDoc()
                if (doc) applyColor(doc, value)
                closePopover()
              }}
            />
          ))}
        </div>
      )}

      {popover === 'link' && (
        <LinkPopover
          title="Inserir link"
          urlLabel="Endereço"
          textLabel="Texto"
          textPlaceholder="Usado quando não há texto selecionado"
          onSubmit={handleSubmit}
          onCancel={closePopover}
        />
      )}

      {popover === 'image' && (
        <LinkPopover
          title="Inserir imagem"
          urlLabel="URL da imagem"
          textLabel="Texto alternativo"
          onSubmit={handleSubmit}
          onCancel={closePopover}
          allowUpload
          uploading={uploading}
          onUpload={handleUpload}
        />
      )}
    </div>
  )
}
