'use client'

import { useState } from 'react'
import { useField } from '@payloadcms/ui'
import { IconPhotoOff } from '@tabler/icons-react'

/**
 * Miniatura da imagem apontada por um campo de texto com URL.
 * Registrado via `admin.components.afterInput` em productMainImg e nas
 * URLs das imagens adicionais.
 */
export function ImagePreview({ path }: { path: string }) {
  const { value } = useField<string>({ path })
  const [failed, setFailed] = useState(false)

  const url = typeof value === 'string' ? value.trim() : ''
  if (!url) return null

  return (
    <div className="uai-image-preview">
      {failed ? (
        <div className="uai-image-preview-empty">
          <IconPhotoOff size={20} />
          <span>Imagem indisponível</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Pré-visualização" onError={() => setFailed(true)} />
      )}
    </div>
  )
}

export default ImagePreview
