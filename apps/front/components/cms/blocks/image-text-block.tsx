import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { RichText } from '@/components/rich-text'
import { ProductImage } from '@/components/ui/product-image'

import type { BlockProps } from './types'

/** Imagem de um lado, texto do outro; no celular, a imagem vem primeiro. */
export function ImageTextBlock({ block, column }: BlockProps<'image-text'>) {
  const image = typeof block.image === 'object' ? block.image : null

  return (
    <section className={cn(column, 'py-12')}>
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div className={cn(block.imagePosition === 'right' && 'md:order-2')}>
          <ProductImage
            src={image?.url}
            alt={image?.alt ?? block.heading ?? ''}
            aspectRatio="4/3"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div>
          {block.heading && (
            <h2 className="mb-4 font-heading text-2xl font-semibold leading-tight text-ink md:text-3xl">
              {block.heading}
            </h2>
          )}
          <RichText data={block.body} />
          {block.buttonText && block.buttonLink && (
            <Button asChild size="lg" className="mt-6">
              <a href={block.buttonLink}>{block.buttonText}</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
