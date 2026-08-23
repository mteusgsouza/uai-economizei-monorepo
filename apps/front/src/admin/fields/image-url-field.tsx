'use client'

import { useState, type ChangeEvent } from 'react'
import { FieldLabel, TextInput, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { IconPhotoOff, IconUpload } from '@tabler/icons-react'

import { uploadImage } from '../lib/upload-image'

/**
 * Campo de URL de imagem com pré-visualização ao lado e envio de arquivo.
 *
 * Substitui o input padrão para poder colocar o preview à direita, grande o
 * suficiente para conferir a imagem sem sair da tela de edição. O botão de
 * enviar sobe o arquivo pro Media e escreve a URL no próprio campo — quem
 * cadastra o produto não precisa passar pela coleção de mídia antes só para
 * copiar um endereço.
 */
export const ImageUrlField: TextFieldClientComponent = ({ field, readOnly }) => {
  const { value, setValue, path, showError, errorMessage, disabled } = useField<string>()
  // `loaded` em vez de só `failed`: entre montar a <img> e o onError disparar o
  // navegador desenha o ícone de imagem quebrada com o texto do alt. O fallback
  // fica por cima até a imagem confirmar que carregou.
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const locked = Boolean(readOnly) || Boolean(disabled)
  const url = typeof value === 'string' ? value.trim() : ''

  // Dentro do array de imagens o path vem como `productImages.0.url`; ali o
  // espaço é estreito e são várias linhas, então o preview fica compacto.
  const compact = path.includes('.')
  const variant = compact ? 'uai-image-field--compact' : 'uai-image-field--hero'

  const applyUrl = (next: string) => {
    setFailed(false)
    setLoaded(false)
    setValue(next)
  }

  const handleFile = async (file: File) => {
    setUploading(true)
    setUploadError('')
    try {
      const { url: uploaded } = await uploadImage(file)
      applyUrl(uploaded)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Falha ao enviar a imagem')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`uai-image-field field-type ${variant}`}>
      <div className="uai-image-field__main">
        <FieldLabel label={field?.label} required={field?.required} path={path} />
        <TextInput
          path={path}
          value={value ?? ''}
          readOnly={locked}
          showError={showError}
          Error={errorMessage ? <div className="field-error">{errorMessage}</div> : undefined}
          placeholder="https://..."
          onChange={(e: ChangeEvent<HTMLInputElement>) => applyUrl(e.target.value)}
        />
        {!locked && (
          <div className="uai-image-field__upload">
            <label className="uai-toggle uai-image-field__upload-button" data-disabled={uploading}>
              <IconUpload size={14} />
              {uploading ? 'Enviando…' : 'Enviar do computador'}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) void handleFile(file)
                }}
              />
            </label>
            {uploadError && <span className="uai-image-field__upload-error">{uploadError}</span>}
          </div>
        )}
        {field?.admin?.description && typeof field.admin.description === 'string' && (
          <p className="uai-field-hint">{field.admin.description}</p>
        )}
      </div>

      <div className="uai-image-field__preview">
        {(!url || failed || !loaded) && (
          <div className="uai-image-preview-empty">
            <IconPhotoOff size={22} />
            <span>{!url ? 'Sem imagem' : failed ? 'Imagem indisponível' : 'Carregando…'}</span>
          </div>
        )}
        {url && !failed && (
          // `alt` vazio de propósito: com texto, o alt aparece na tela enquanto
          // a imagem não resolve. A descrição de verdade é o rótulo do campo.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            hidden={!loaded}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(false)
              setFailed(true)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ImageUrlField
