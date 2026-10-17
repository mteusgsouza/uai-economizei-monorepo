
import { PromoSlide } from '@/components/layout/promo-slide'
import { getLivePromotion } from '@/lib/catalog/promotions'
import { relationId } from '@/lib/relation-id'

import { BlockSection } from './block-section'
import type { BlockProps } from './types'

/**
 * A promoção escolhida, desenhada como o banner da home. Fora do período ou
 * inativa, `getLivePromotion` devolve `null` e o bloco some — a página volta
 * ao normal sozinha quando a campanha acaba.
 */
export async function PromotionBlock({ block, column }: BlockProps<'promotion'>) {
  const id = relationId(block.promotion)
  const promo = id === null ? null : await getLivePromotion(id)
  if (!promo) return null

  return (
    <BlockSection column={column} width={block.width}>
      <PromoSlide promo={promo} />
    </BlockSection>
  )
}
