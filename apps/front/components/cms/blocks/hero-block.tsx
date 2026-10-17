import { Button } from '@workspace/ui/components/button'

import type { BlockProps } from './types'

/** Banner de abertura: ignora a coluna do template e ocupa a largura toda. */
export function HeroBlock({ block }: Pick<BlockProps<'hero'>, 'block'>) {
  return (
    <section className="relative flex min-h-[400px] items-center justify-center bg-surface">
      <div className="mx-auto max-w-[1280px] px-8 text-center">
        <h1 className="font-heading text-4xl font-semibold leading-tight tracking-[-0.005em] text-ink md:text-5xl">
          {block.heading}
        </h1>
        {block.subtext && (
          <p className="mt-4 text-lg leading-relaxed text-steel">{block.subtext}</p>
        )}
        {block.ctaText && (
          <Button asChild size="lg" className="mt-8">
            <a href={block.ctaLink ?? '#'}>{block.ctaText}</a>
          </Button>
        )}
      </div>
    </section>
  )
}
