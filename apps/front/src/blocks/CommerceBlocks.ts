import type { Block } from 'payload'

import { BLOCK_GROUP, imagePositionField } from './fields'

// Os blocos de venda apontam para o cadastro em vez de copiar: preço, foto,
// estoque e período vêm de lá na hora de montar a página.

export const ProductHighlightBlock: Block = {
  slug: 'product-highlight',
  labels: { singular: 'Destaque de produto', plural: 'Destaques de produto' },
  imageURL: '/cms-blocks/product-highlight.svg',
  imageAltText: 'Um produto em evidência: foto grande, texto de venda, preço e botão de comprar',
  admin: { group: BLOCK_GROUP.commerce },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      label: 'Produto',
      filterOptions: { active: { equals: true } },
      admin: { description: 'Preço, foto e o botão de comprar vêm do cadastro do produto.' },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Título',
      admin: { description: 'Em branco, usa o nome do produto.' },
    },
    { name: 'body', type: 'textarea', label: 'Texto de venda' },
    {
      name: 'benefits',
      type: 'array',
      label: 'Benefícios',
      labels: { singular: 'Benefício', plural: 'Benefícios' },
      maxRows: 6,
      fields: [{ name: 'text', type: 'text', required: true, label: 'Benefício' }],
    },
    imagePositionField,
  ],
}

export const PromotionBlock: Block = {
  slug: 'promotion',
  labels: { singular: 'Promoção', plural: 'Promoções' },
  imageURL: '/cms-blocks/promotion.svg',
  imageAltText: 'Banner de uma promoção cadastrada, com selo de desconto, preço e botão',
  admin: { group: BLOCK_GROUP.commerce },
  fields: [
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
      required: true,
      label: 'Promoção',
      admin: {
        description: 'Fora do período da promoção, ou com ela inativa, o bloco some da página sozinho.',
      },
    },
  ],
}

export const ComparisonBlock: Block = {
  slug: 'comparison',
  labels: { singular: 'Comparação', plural: 'Comparações' },
  imageURL: '/cms-blocks/comparison.svg',
  imageAltText: 'Tabela com produtos lado a lado: preço, pagamento, marca e ficha técnica',
  admin: { group: BLOCK_GROUP.commerce },
  fields: [
    { name: 'title', type: 'text', label: 'Título da seção' },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: true,
      minRows: 2,
      maxRows: 4,
      label: 'Produtos',
      filterOptions: { active: { equals: true } },
      admin: {
        description: 'De 2 a 4 produtos. Preço, Pix, marca e a ficha técnica entram sozinhos.',
      },
    },
  ],
}
