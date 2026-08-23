import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { blobStorageEnabled, runningOnVercel } from '../storage'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mídia',
    plural: 'Mídia',
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Sem o Blob, o Payload cai no `staticDir` — que na Vercel é um filesystem
    // somente leitura. O erro cru vira "Something went wrong." na tela, sem
    // dizer o que falta; este aviso troca isso por uma instrução.
    beforeOperation: [
      ({ operation }) => {
        const writing = operation === 'create' || operation === 'update'
        if (writing && runningOnVercel && !blobStorageEnabled) {
          throw new APIError(
            'Armazenamento de arquivos não configurado: falta a variável BLOB_READ_WRITE_TOKEN (Vercel Blob). Sem ela o upload não tem onde gravar.',
            500,
          )
        }
      },
    ],
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'cover', width: 1200, height: 630, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Texto alternativo' },
  ],
}
