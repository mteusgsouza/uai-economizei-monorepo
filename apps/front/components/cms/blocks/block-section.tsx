import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import type { BlockOf } from './types'

/** As larguras do admin — mesmo campo em todos os blocos que o têm. */
type BlockWidth = NonNullable<BlockOf<'video'>['width']>

/** Teto de cada largura do admin; `w-full` garante que nunca passa da margem. */
const WIDTH_CLASS: Record<BlockWidth, string> = {
  full: '',
  wide: 'max-w-5xl',
  medium: 'max-w-3xl',
  narrow: 'max-w-xl',
}

interface BlockSectionProps {
  /** Coluna do site (as margens do cabeçalho). */
  column: string
  /** Largura escolhida no admin; em branco, a do site. */
  width?: BlockWidth | null
  children: ReactNode
}

/**
 * A seção de um bloco: dentro da coluna do site, centralizada na largura
 * escolhida. É `@container`: o conteúdo se arranja pela largura do bloco, não
 * da tela — um bloco estreito num monitor grande empilha como no celular.
 */
export function BlockSection({ column, width, children }: BlockSectionProps) {
  return (
    <section className={cn(column, 'py-12')}>
      <div className={cn('@container mx-auto w-full', WIDTH_CLASS[width ?? 'full'])}>
        {children}
      </div>
    </section>
  )
}
