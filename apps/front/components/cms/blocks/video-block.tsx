
import { youtubeEmbedUrl, youtubeId } from '@/lib/video/youtube'

import { BlockHeading } from './block-heading'
import { BlockSection } from './block-section'
import type { BlockProps } from './types'

/**
 * Vídeo do YouTube pelo domínio sem cookie: nada é gravado no navegador antes
 * do play, o que mantém o aviso de cookies verdadeiro. Link inválido (o admin
 * já recusa, mas o dado pode ser antigo): o bloco não aparece.
 */
export function VideoBlock({ block, column }: BlockProps<'video'>) {
  const id = youtubeId(block.url)
  if (!id) return null

  return (
    <BlockSection column={column} width={block.width}>
      {block.title && <BlockHeading>{block.title}</BlockHeading>}
      <figure>
        <div className="aspect-video w-full overflow-hidden bg-ink">
          <iframe
            src={youtubeEmbedUrl(id)}
            title={block.title ?? 'Vídeo'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="size-full border-0"
          />
        </div>
        {block.caption && (
          <figcaption className="mt-3 text-center text-sm text-steel">{block.caption}</figcaption>
        )}
      </figure>
    </BlockSection>
  )
}
