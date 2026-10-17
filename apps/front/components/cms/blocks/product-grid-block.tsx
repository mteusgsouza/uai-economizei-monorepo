
import { BlockHeading } from './block-heading'
import { BlockSection } from './block-section'
import type { BlockProps } from './types'

// TODO: este bloco ainda é placeholder — mostra o ID em vez do produto. Falta
// buscar o catálogo com `getProduct` e renderizar `ProductCardCompact`.
export function ProductGridBlock({ block, column }: BlockProps<'product-grid'>) {
  return (
    <BlockSection column={column} width={block.width}>
      {block.title && <BlockHeading>{block.title}</BlockHeading>}
      <div className="grid grid-cols-2 gap-4 @2xl:grid-cols-4">
        {block.productIds?.map((item, i) => (
          <div
            key={item.id ?? i}
            className="rounded-lg border border-hairline p-4 text-center text-steel"
          >
            Produto: {item.productId}
          </div>
        ))}
      </div>
    </BlockSection>
  )
}
