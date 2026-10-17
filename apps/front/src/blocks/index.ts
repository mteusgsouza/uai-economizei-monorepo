import type { Block } from 'payload'

import { slugify } from '../../lib/slugify'
import { ComparisonBlock, ProductHighlightBlock, PromotionBlock } from './CommerceBlocks'
import { ImageTextBlock, VideoBlock } from './MediaBlocks'
import { CTABlock, ContentBlock, FAQBlock, HeroBlock, ProductGridBlock } from './PageBlocks'

/** Os blocos da página, na ordem do seletor dentro de cada grupo. */
export const PAGE_BLOCKS: Block[] = [
  HeroBlock,
  ContentBlock,
  ImageTextBlock,
  VideoBlock,
  CTABlock,
  FAQBlock,
  ProductHighlightBlock,
  ProductGridBlock,
  ComparisonBlock,
  PromotionBlock,
]

function nameBase(block: Block): string {
  const label = block.labels?.singular
  return (typeof label === 'string' && slugify(label)) || block.slug
}

/** Base do nome automático de cada tipo: "Vídeo" → `video` (vira `video-1`). */
export const BLOCK_NAME_BASE: Readonly<Record<string, string>> = Object.fromEntries(
  PAGE_BLOCKS.map((block) => [block.slug, nameBase(block)]),
)

export function blockNameBase(blockType: string): string {
  return BLOCK_NAME_BASE[blockType] ?? blockType
}
