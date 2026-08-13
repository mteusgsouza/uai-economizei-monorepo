import { cn } from '@workspace/ui/lib/utils'

import type { BlockProps } from './types'

// TODO: este bloco ainda é placeholder — mostra o ID em vez do produto. Falta
// buscar o catálogo com `getProduct` e renderizar `ProductCardCompact`.
export function ProductGridBlock({ block, column }: BlockProps<'product-grid'>) {
  return (
    <section className={cn(column, 'py-12')}>
      {block.title && (
        <h2 className="mb-8 text-center font-heading text-2xl font-semibold tracking-[-0.005em] text-ink md:text-3xl">
          {block.title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {block.productIds?.map((item, i) => (
          <div
            key={item.id ?? i}
            className="rounded-lg border border-hairline p-4 text-center text-steel"
          >
            Produto: {item.productId}
          </div>
        ))}
      </div>
    </section>
  )
}
