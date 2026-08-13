import { RichText } from '@/components/rich-text'
import { cn } from '@workspace/ui/lib/utils'

import type { BlockProps } from './types'

export function ContentBlock({ block, column }: BlockProps<'content'>) {
  return (
    <section className={cn(column, 'py-12')}>
      <RichText data={block.body} />
    </section>
  )
}
