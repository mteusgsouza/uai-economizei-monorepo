import { RichText } from '@/components/rich-text'

import { BlockHeading } from './block-heading'
import { BlockSection } from './block-section'
import type { BlockProps } from './types'

export function FaqBlock({ block, column }: BlockProps<'faq'>) {
  return (
    <BlockSection column={column} width={block.width}>
      {block.title && <BlockHeading>{block.title}</BlockHeading>}
      <dl className="space-y-4">
        {block.questions?.map((item, i) => (
          <details key={item.id ?? i} className="rounded-lg border border-hairline p-4">
            <summary className="cursor-pointer font-medium text-ink">{item.question}</summary>
            <RichText className="mt-3" data={item.answer} />
          </details>
        ))}
      </dl>
    </BlockSection>
  )
}
