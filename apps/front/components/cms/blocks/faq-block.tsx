import { RichText } from '@/components/rich-text'
import { cn } from '@workspace/ui/lib/utils'

import type { BlockProps } from './types'

export function FaqBlock({ block, column }: BlockProps<'faq'>) {
  return (
    <section className={cn(column, 'py-12')}>
      {block.title && (
        <h2 className="mb-8 text-center font-heading text-2xl font-semibold tracking-[-0.005em] text-ink md:text-3xl">
          {block.title}
        </h2>
      )}
      <dl className="space-y-4">
        {block.questions?.map((item, i) => (
          <details key={item.id ?? i} className="rounded-lg border border-hairline p-4">
            <summary className="cursor-pointer font-medium text-ink">{item.question}</summary>
            <RichText className="mt-3" data={item.answer} />
          </details>
        ))}
      </dl>
    </section>
  )
}
