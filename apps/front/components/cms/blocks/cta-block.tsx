import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { BlockSection } from './block-section'
import type { BlockOf, BlockProps } from './types'

type CtaStyle = NonNullable<BlockOf<'cta'>['style']>

// Primário é a faixa escura do sistema (a mesma da faixa de benefícios); o
// botão é sempre o primário do `Button`, a única superfície sólida do Industry.
const CTA_STYLES: Record<CtaStyle, string> = {
  primary: 'bg-accent-900 text-on-dark',
  secondary: 'bg-surface text-ink',
  outline: 'border border-primary text-ink',
}

export function CtaBlock({ block, column }: BlockProps<'cta'>) {
  return (
    <BlockSection column={column} width={block.width}>
      <div className={cn('px-8 py-12 text-center', CTA_STYLES[block.style ?? 'primary'])}>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.005em] md:text-3xl">
          {block.heading}
        </h2>
        {block.body && <p className="mt-4 leading-relaxed">{block.body}</p>}
        <Button asChild size="lg" className="mt-8">
          <a href={block.buttonLink ?? '#'}>{block.buttonText}</a>
        </Button>
      </div>
    </BlockSection>
  )
}
