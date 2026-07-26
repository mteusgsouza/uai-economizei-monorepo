'use client'

import { useState, type ChangeEvent } from 'react'
import { FieldLabel, TextInput, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { IconPhotoOff } from '@tabler/icons-react'

/**
 * Campo de URL de imagem com pré-visualização ao lado.
 *
 * Substitui o input padrão para poder colocar o preview à direita, grande o
 * suficiente para conferir a imagem sem sair da tela de edição.
 */
export const ImageUrlField: TextFieldClientComponent = ({ field, readOnly }) => {
  const { value, setValue, path, showError, errorMessage, disabled } = useField<string>()
  const [failed, setFailed] = useState(false)

  const locked = Boolean(readOnly) || Boolean(disabled)
  const url = typeof value === 'string' ? value.trim() : ''

  // Dentro do array de imagens o path vem como `productImages.0.url`; ali o
  // espaço é estreito e são várias linhas, então o preview fica compacto.
  const compact = path.includes('.')
  const variant = compact ? 'uai-image-field--compact' : 'uai-image-field--hero'

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
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setFailed(false)
            setValue(e.target.value)
          }}
        />
        {field?.admin?.description && typeof field.admin.description === 'string' && (
          <p className="uai-field-hint">{field.admin.description}</p>
        )}
      </div>

      <div className="uai-image-field__preview">
        {!url || failed ? (
          <div className="uai-image-preview-empty">
            <IconPhotoOff size={22} />
            <span>{url ? 'Imagem indisponível' : 'Sem imagem'}</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Pré-visualização" onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  )
}

export default ImageUrlField
