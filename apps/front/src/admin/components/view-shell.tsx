import type { ReactNode } from 'react'

import { PushBell } from './PushBell'

interface ViewShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

/**
 * Casca das views customizadas do admin.
 * A classe `uai-admin` escopa o Tailwind/estilos próprios para não vazar
 * no restante do admin do Payload.
 */
export function ViewShell({ title, subtitle, children }: ViewShellProps) {
  return (
    <div className="uai-admin">
      <header className="uai-view-header">
        <div>
          <h1 className="uai-view-title">{title}</h1>
          {subtitle && <p className="uai-view-subtitle">{subtitle}</p>}
        </div>
        <PushBell />
      </header>
      {children}
    </div>
  )
}
