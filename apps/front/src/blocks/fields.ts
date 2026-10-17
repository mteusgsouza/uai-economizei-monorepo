import type { Field } from 'payload'

/** Grupos do seletor de blocos: quem monta a página procura pelo que quer mostrar. */
export const BLOCK_GROUP = {
  content: 'Conteúdo',
  commerce: 'Produtos e vendas',
} as const

export const imagePositionField: Field = {
  name: 'imagePosition',
  type: 'select',
  label: 'Lado da imagem',
  defaultValue: 'left',
  options: [
    { label: 'Imagem à esquerda', value: 'left' },
    { label: 'Imagem à direita', value: 'right' },
  ],
}
