import type { Block } from 'payload'

import { youtubeId } from '../../lib/video/youtube'
import { BLOCK_GROUP, imagePositionField } from './fields'

export const ImageTextBlock: Block = {
  slug: 'image-text',
  labels: { singular: 'Imagem com texto', plural: 'Imagens com texto' },
  imageURL: '/cms-blocks/image-text.svg',
  imageAltText: 'Uma imagem de um lado e o texto do outro',
  admin: { group: BLOCK_GROUP.content },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Imagem' },
    { name: 'heading', type: 'text', label: 'Título' },
    { name: 'body', type: 'richText', required: true, label: 'Texto' },
    imagePositionField,
    {
      type: 'row',
      fields: [
        { name: 'buttonText', type: 'text', label: 'Texto do botão' },
        {
          name: 'buttonLink',
          type: 'text',
          label: 'Link do botão',
          admin: { description: 'Ex.: /produtos ou /entregas' },
        },
      ],
    },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Vídeo', plural: 'Vídeos' },
  imageURL: '/cms-blocks/video.svg',
  imageAltText: 'Vídeo do YouTube na largura da página, com título e legenda',
  admin: { group: BLOCK_GROUP.content },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Link do YouTube',
      admin: { description: 'Cole o link do vídeo, como youtube.com/watch?v=… ou youtu.be/…' },
      validate: (value: string | null | undefined) =>
        youtubeId(value) ? true : 'Cole um link de vídeo do YouTube (youtube.com/watch?v=… ou youtu.be/…).',
    },
    { name: 'title', type: 'text', label: 'Título' },
    { name: 'caption', type: 'text', label: 'Legenda' },
  ],
}
