'use client'

import { useEffect, type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Modal simples das views admin — fecha no Esc e no clique fora. */
export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="uai-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="uai-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="uai-modal-header">
          <h2 className="uai-modal-title">{title}</h2>
          <button
            type="button"
            className="uai-icon-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <IconX size={18} />
          </button>
        </header>
        <div className="uai-modal-body">{children}</div>
      </div>
    </div>
  )
}
