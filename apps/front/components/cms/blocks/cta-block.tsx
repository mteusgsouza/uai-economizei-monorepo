import { cn } from '@workspace/ui/lib/utils'

import type { BlockOf, BlockProps } from './types'

type CtaStyle = NonNullable<BlockOf<'cta'>['style']>

const CTA_STYLES: Record<CtaStyle, string> = {
  primary: 'bg-brand-green-deep text-on-dark',
  secondary: 'bg-surface text-ink',
  outline: 'border-2 border-brand-green-deep text-ink',
}

export function CtaBlock({ block, column }: BlockProps<'cta'>) {
  return (
    <section className={cn(column, 'py-12')}>
      <div className={cn('rounded-xl px-8 py-12 text-center', CTA_STYLES[block.style ?? 'primary'])}>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.005em] md:text-3xl">
          {block.heading}
        </h2>
        {block.body && <p className="mt-4 leading-relaxed">{block.body}</p>}
        <a
          href={block.buttonLink ?? '#'}
          className="mt-8 inline-block rounded-lg bg-canvas px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
        >
          {block.buttonText}
        </a>
      </div>
    </section>
  )
}
