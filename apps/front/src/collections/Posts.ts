import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'Identificador único na URL (ex: "meu-primeiro-post")',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Resumo',
      admin: {
        description: 'Breve descrição exibida nas listagens',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagem de capa',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Conteúdo',
      required: true,
      // Herda o editor global (payload.config.ts) que já inclui ProductEmbedBlock
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Data de publicação',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
    },
  ],
}
