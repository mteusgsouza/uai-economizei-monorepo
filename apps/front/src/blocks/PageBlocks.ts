import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Banner de abertura', plural: 'Banners de abertura' },
  imageURL: '/cms-blocks/hero.svg',
  imageAltText: 'Faixa larga no topo da página, com título, subtítulo e um botão',
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
  labels: { singular: 'Texto', plural: 'Textos' },
  imageURL: '/cms-blocks/content.svg',
  imageAltText: 'Texto corrido com títulos e parágrafos',
  fields: [
    { name: 'body', type: 'richText', required: true, label: 'Texto' },
  ],
}

export const ProductGridBlock: Block = {
  slug: 'product-grid',
  labels: { singular: 'Grade de produtos', plural: 'Grades de produtos' },
  imageURL: '/cms-blocks/product-grid.svg',
  imageAltText: 'Produtos lado a lado, com foto, nome, preço e botão',
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
  labels: { singular: 'Chamada para ação', plural: 'Chamadas para ação' },
  imageURL: '/cms-blocks/cta.svg',
  imageAltText: 'Faixa escura em destaque, com título, frase curta e um botão',
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
  labels: { singular: 'Perguntas frequentes', plural: 'Perguntas frequentes' },
  imageURL: '/cms-blocks/faq.svg',
  imageAltText: 'Lista de perguntas que abrem a resposta ao clicar',
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
