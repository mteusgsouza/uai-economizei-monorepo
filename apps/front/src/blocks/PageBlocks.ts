import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Título' },
    { name: 'subtext', type: 'textarea', label: 'Subtítulo' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Imagem de fundo' },
    { name: 'ctaText', type: 'text', label: 'Texto do botão' },
    { name: 'ctaLink', type: 'text', label: 'Link do botão' },
  ],
}

export const ContentBlock: Block = {
  slug: 'content',
  labels: { singular: 'Conteúdo', plural: 'Conteúdo' },
  fields: [
    { name: 'body', type: 'richText', required: true, label: 'Texto' },
  ],
}

export const ProductGridBlock: Block = {
  slug: 'product-grid',
  labels: { singular: 'Grade de Produtos', plural: 'Grade de Produtos' },
  fields: [
    { name: 'title', type: 'text', label: 'Título da seção' },
    {
      name: 'productIds',
      type: 'array',
      label: 'Produtos',
      minRows: 1,
      fields: [
        { name: 'productId', type: 'text', required: true, label: 'ID do Produto' },
      ],
    },
  ],
}

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'Call to Action', plural: 'Call to Action' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Título' },
    { name: 'body', type: 'textarea', label: 'Descrição' },
    { name: 'buttonText', type: 'text', required: true, label: 'Texto do botão' },
    { name: 'buttonLink', type: 'text', required: true, label: 'Link do botão' },
    { name: 'style', type: 'select', label: 'Estilo', options: [
      { label: 'Primário', value: 'primary' },
      { label: 'Secundário', value: 'secondary' },
      { label: 'Outline', value: 'outline' },
    ], defaultValue: 'primary' },
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    { name: 'title', type: 'text', label: 'Título da seção' },
    {
      name: 'questions',
      type: 'array',
      label: 'Perguntas',
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Pergunta' },
        { name: 'answer', type: 'richText', required: true, label: 'Resposta' },
      ],
    },
  ],
}
