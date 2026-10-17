import type { ReactNode } from 'react'

/** O título centralizado que abre uma seção de bloco (FAQ, grade, comparação…). */
export function BlockHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-8 text-center font-heading text-2xl font-semibold tracking-[-0.005em] text-ink md:text-3xl">
      {children}
    </h2>
  )
}
