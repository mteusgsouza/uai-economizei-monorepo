import type { Field } from 'payload'

/** Grupos do seletor de blocos: quem monta a página procura pelo que quer mostrar. */
export const BLOCK_GROUP = {
  content: 'Conteúdo',
  commerce: 'Produtos e vendas',
} as const

export type BlockWidth = 'full' | 'wide' | 'medium' | 'narrow'

const WIDTH_LABEL: Record<BlockWidth, string> = {
  full: 'Largura do site',
  wide: 'Larga',
  medium: 'Média',
  narrow: 'Estreita',
}

/**
 * Largura do bloco, centralizado dentro da margem do site — nunca passa dela,
 * e no celular ele ocupa a tela toda. `allowed` limita as opções de quem não
 * se arranja estreito (o banner de promoção).
 */
export function blockWidthField(
  defaultValue: BlockWidth,
  allowed: readonly BlockWidth[] = ['full', 'wide', 'medium', 'narrow'],
): Field {
  return {
    name: 'width',
    type: 'select',
    label: 'Largura',
    defaultValue,
    options: allowed.map((value) => ({ label: WIDTH_LABEL[value], value })),
    admin: { description: 'O bloco fica centralizado. No celular ele sempre ocupa a tela toda.' },
  }
}

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
