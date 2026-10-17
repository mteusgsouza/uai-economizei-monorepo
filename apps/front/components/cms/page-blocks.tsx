import { Fragment } from 'react'

import { SITE_CONTAINER } from '@/components/layout/container'

import { ComparisonBlock } from './blocks/comparison-block'
import { ContentBlock } from './blocks/content-block'
import { CtaBlock } from './blocks/cta-block'
import { FaqBlock } from './blocks/faq-block'
import { HeroBlock } from './blocks/hero-block'
import { ImageTextBlock } from './blocks/image-text-block'
import { ProductGridBlock } from './blocks/product-grid-block'
import { ProductHighlightBlock } from './blocks/product-highlight-block'
import { PromotionBlock } from './blocks/promotion-block'
import type { LayoutBlock, PageLayout } from './blocks/types'
import { VideoBlock } from './blocks/video-block'

interface PageBlocksProps {
  blocks: PageLayout
  /** Largura de leitura do texto corrido, definida pelo template da página. */
  measure: string
}

/**
 * Roteia cada bloco montado no admin para o componente que sabe renderizá-lo,
 * na ordem em que o editor os colocou. Os blocos aqui são os componentes React;
 * a configuração dos campos vive em `src/blocks/`.
 */
export function PageBlocks({ blocks, measure }: PageBlocksProps) {
  // Todo bloco usa a coluna do site: as margens batem com cabeçalho e rodapé.
  const column = SITE_CONTAINER

  function renderBlock(block: LayoutBlock) {
    switch (block.blockType) {
      case 'hero':
        return <HeroBlock block={block} />
      case 'content':
        return <ContentBlock block={block} column={column} measure={measure} />
      case 'image-text':
        return <ImageTextBlock block={block} column={column} />
      case 'video':
        return <VideoBlock block={block} column={column} />
      case 'cta':
        return <CtaBlock block={block} column={column} />
      case 'faq':
        return <FaqBlock block={block} column={column} />
      case 'product-highlight':
        return <ProductHighlightBlock block={block} column={column} />
      case 'product-grid':
        return <ProductGridBlock block={block} column={column} />
      case 'comparison':
        return <ComparisonBlock block={block} column={column} />
      case 'promotion':
        return <PromotionBlock block={block} column={column} />
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
