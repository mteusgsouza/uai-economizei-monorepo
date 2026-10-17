import { RichText } from '@/components/rich-text'
import { cn } from '@workspace/ui/lib/utils'

import type { BlockProps } from './types'

interface ContentBlockProps extends BlockProps<'content'> {
  /** Largura de leitura do template: a linha não atravessa a tela toda. */
  measure: string
}

/** Texto corrido na margem do site, com a largura de leitura do template. */
export function ContentBlock({ block, column, measure }: ContentBlockProps) {
  return (
    <section className={cn(column, 'py-12')}>
      <div className={measure}>
        <RichText data={block.body} />
      </div>
    </section>
  )
}
