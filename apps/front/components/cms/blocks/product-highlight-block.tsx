import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { ProductPrice } from '@/components/product/product-price'
import { AddToCartButton } from '@/components/ui/add-to-cart-button'
import { Mono } from '@/components/ui/mono'
import { ProductImage } from '@/components/ui/product-image'
import { getProduct } from '@/lib/catalog/products'
import { getStoreSettings } from '@/lib/catalog/settings'
import { relationId } from '@/lib/relation-id'

import { BlockSection } from './block-section'
import type { BlockProps } from './types'

/**
 * Um produto em evidência. O texto é do bloco; preço, foto e estoque vêm do
 * cadastro na hora (`getProduct`, tag `products`). Produto inativo ou
 * removido: o bloco some em vez de mostrar um card quebrado.
 */
export async function ProductHighlightBlock({ block, column }: BlockProps<'product-highlight'>) {
  const id = relationId(block.product)
  const [product, settings] = await Promise.all([
    id === null ? null : getProduct(id),
    getStoreSettings(),
  ])
  if (!product) return null

  const href = `/produtos/${product.id}`

  return (
    <BlockSection column={column} width={block.width}>
      <div className="grid items-center gap-8 @2xl:grid-cols-2">
        <Link
          href={href}
          className={cn('blueprint block p-4', block.imagePosition === 'right' && '@2xl:order-2')}
        >
          <div className="duotone">
            {/* Como na página do produto: a foto grande não é cortada no quadrado */}
            <ProductImage
              src={product.productMainImg}
              alt={product.name}
              aspectRatio="auto"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Link>

        <div>
          {product.brand && (
            <Mono as="p" className="text-ink/50">
              {product.brand.name}
            </Mono>
          )}
          <h2 className="mt-1 font-heading text-3xl font-semibold leading-tight text-ink">
            {block.heading || product.name}
          </h2>
          {block.body && <p className="mt-4 leading-relaxed text-steel">{block.body}</p>}
          {block.benefits && block.benefits.length > 0 && (
            <ul className="mt-5 space-y-2">
              {block.benefits.map((benefit, i) => (
                <li key={benefit.id ?? i} className="flex gap-2.5 text-ink">
                  <Check className="mt-0.5 size-4 flex-none text-accent-700" />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          )}
          <ProductPrice
            product={product}
            pixDiscountPercent={settings.pixDiscountPercent}
            maxInstallments={settings.maxInstallments}
            size="lg"
            className="mt-6 border-t border-divider pt-4"
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <AddToCartButton product={product} size="lg" />
            <Button asChild variant="outline" size="lg">
              <Link href={href}>Ver detalhes</Link>
            </Button>
          </div>
        </div>
      </div>
    </BlockSection>
  )
}
