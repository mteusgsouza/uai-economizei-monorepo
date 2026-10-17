import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { AddToCartButton } from '@/components/ui/add-to-cart-button'
import { Mono } from '@/components/ui/mono'
import { ProductImage } from '@/components/ui/product-image'
import { getProduct } from '@/lib/catalog/products'
import { getStoreSettings } from '@/lib/catalog/settings'
import { getProductSpecSheet } from '@/lib/catalog/specs'
import { comparisonRows } from '@/lib/comparison/rows'
import { relationId } from '@/lib/relation-id'
import type { Product } from '@/types/product'

import { BlockHeading } from './block-heading'
import type { BlockProps } from './types'

/**
 * Produtos lado a lado. Tudo vem do cadastro na hora: produto que saiu do ar
 * cai da tabela, e com menos de dois sobrando o bloco some (não há o que
 * comparar). No celular a tabela rola de lado, com a coluna de rótulos fixa.
 */
export async function ComparisonBlock({ block, column }: BlockProps<'comparison'>) {
  const ids = (block.products ?? []).map(relationId).filter((id): id is number => id !== null)
  const [found, settings] = await Promise.all([
    Promise.all(ids.map((id) => getProduct(id))),
    getStoreSettings(),
  ])
  const products = found.filter((product): product is Product => product !== null)
  if (products.length < 2) return null

  const sheets = await Promise.all(products.map((product) => getProductSpecSheet(product.id)))
  const rows = comparisonRows(products, sheets, settings)

  return (
    <section className={cn(column, 'py-12')}>
      {block.title && <BlockHeading>{block.title}</BlockHeading>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 w-32 bg-canvas" />
              {products.map((product) => (
                <th key={product.id} scope="col" className="p-3 text-left align-top font-normal">
                  <Link href={`/produtos/${product.id}`} className="group block">
                    <div className="duotone">
                      <ProductImage src={product.productMainImg} alt={product.name} sizes="200px" />
                    </div>
                    <div className="mt-2 line-clamp-2 font-heading text-base leading-tight text-ink group-hover:text-accent-700">
                      {product.name}
                    </div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-divider">
                <th scope="row" className="sticky left-0 bg-canvas p-3 text-left align-top font-normal">
                  <Mono className="text-ink/50">{row.label}</Mono>
                </th>
                {row.values.map((value, i) => (
                  <td key={products[i]?.id ?? i} className="p-3 align-top text-ink">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-divider">
              <td className="sticky left-0 bg-canvas" />
              {products.map((product) => (
                <td key={product.id} className="p-3">
                  <AddToCartButton product={product} size="sm" className="w-full" />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
