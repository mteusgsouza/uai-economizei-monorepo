import type { Page } from '@/payload-types'

export type PageLayout = NonNullable<Page['layout']>
export type LayoutBlock = PageLayout[number]

/** Um bloco específico do layout, estreitado pelo `blockType`. */
export type BlockOf<T extends LayoutBlock['blockType']> = Extract<LayoutBlock, { blockType: T }>

export interface BlockProps<T extends LayoutBlock['blockType']> {
  block: BlockOf<T>
  /** Coluna de conteúdo definida pelo template da página. */
  column: string
}
