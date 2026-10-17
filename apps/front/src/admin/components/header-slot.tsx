'use client'

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const noSubscription = () => () => {}

/**
 * `false` no SSR e durante a hidratação, `true` depois — sem setState em
 * efeito. Montado já no cliente (navegação entre docs), é `true` de cara.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  )
}

/**
 * Um contêiner só ao lado do título, criado por quem chegar primeiro. Cada
 * slot entra no fim dele, então a ordem na tela segue a ordem de montagem
 * (a de `beforeDocumentControls`) em vez de a última tag ficar colada no título.
 */
function headerContainer(): HTMLElement | null {
  const title = document.querySelector('.doc-header__title')
  if (!title) return null

  const next = title.nextElementSibling
  if (next instanceof HTMLElement && next.classList.contains('uai-doc-header-extras')) return next

  const container = document.createElement('span')
  container.className = 'uai-doc-header-extras'
  title.insertAdjacentElement('afterend', container)
  return container
}

/**
 * Leva `children` para o lado do título do documento.
 *
 * O Payload não expõe slot junto ao título (só `beforeDocumentControls`,
 * `editMenuItems`, os botões e `Status`), então quem usa isto monta no slot
 * dos controles — onde tem o contexto do formulário — e é portado para o
 * header. O `h1` tem `overflow: hidden` com ellipsis: o conteúdo entra como
 * irmão dele, não dentro.
 */
export function HeaderSlot({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()

  // O nó nasce uma vez, no inicializador — não em efeito. Renderizar dentro dele
  // antes de estar no documento é válido: o efeito só o encaixa no header.
  // `document` não existe no SSR do admin, daí a guarda.
  const [slot] = useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null
    const el = document.createElement('span')
    el.className = 'uai-header-slot'
    return el
  })

  useEffect(() => {
    if (!slot) return
    headerContainer()?.appendChild(slot)
    return () => {
      slot.remove()
    }
  }, [slot])

  // O SSR não tem onde portar e não renderiza nada; o primeiro render do
  // cliente precisa dar o mesmo resultado, senão a hidratação quebra. O portal
  // só entra no render seguinte, já fora da hidratação.
  if (!slot || !hydrated) return null

  return createPortal(children, slot)
}
