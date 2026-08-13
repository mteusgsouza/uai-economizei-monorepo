import { Fragment } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { ContentBlock } from './blocks/content-block'
import { CtaBlock } from './blocks/cta-block'
import { FaqBlock } from './blocks/faq-block'
import { HeroBlock } from './blocks/hero-block'
import { ProductGridBlock } from './blocks/product-grid-block'
import type { LayoutBlock, PageLayout } from './blocks/types'

interface PageBlocksProps {
  blocks: PageLayout
  /** Largura da coluna de conteúdo, definida pelo template da página. */
  container: string
}

/**
 * Roteia cada bloco montado no admin para o componente que sabe renderizá-lo,
 * na ordem em que o editor os colocou. Os blocos aqui são os componentes React;
 * a configuração dos campos vive em `src/blocks/PageBlocks.ts`.
 */
export function PageBlocks({ blocks, container }: PageBlocksProps) {
  // A largura é do template da página, não de cada bloco por conta própria.
  const column = cn('mx-auto w-full px-8', container)

  function renderBlock(block: LayoutBlock) {
    switch (block.blockType) {
      case 'hero':
        return <HeroBlock block={block} />
      case 'content':
        return <ContentBlock block={block} column={column} />
      case 'product-grid':
        return <ProductGridBlock block={block} column={column} />
      case 'cta':
        return <CtaBlock block={block} column={column} />
      case 'faq':
        return <FaqBlock block={block} column={column} />
    }
  }

  return (
    <>
      {blocks.map((block, i) => (
        <Fragment key={block.id ?? i}>{renderBlock(block)}</Fragment>
      ))}
    </>
  )
}
