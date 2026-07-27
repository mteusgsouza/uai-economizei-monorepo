'use client'

import { useEffect, useState } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'

import { useFilterNavigation } from '../lib/use-filter-navigation'

const SEARCH_DELAY_MS = 400

/** Busca com atraso: navegar a cada tecla recarregaria a lista sem parar. */
export function FilterSearch({
  label,
  placeholder,
  value,
}: {
  label: string
  placeholder: string
  value?: string
}) {
  const navigate = useFilterNavigation()
  const [term, setTerm] = useState(value ?? '')
  const [lastValue, setLastValue] = useState(value)

  // Ajuste durante o render (padrão do React) em vez de sincronizar por efeito
  if (value !== lastValue) {
    setLastValue(value)
    setTerm(value ?? '')
  }

  useEffect(() => {
    if (term === (value ?? '')) return
    const timer = window.setTimeout(() => navigate('search', term.trim()), SEARCH_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [term, value, navigate])

  return (
    <label className="uai-filter-field uai-filter-field--grow">
      <span className="uai-filter-label">{label}</span>
      <span className="uai-filter-search">
        <IconSearch size={16} className="uai-filter-search-icon" />
        <input
          className="uai-filter-input"
          value={term}
          placeholder={placeholder}
          onChange={(e) => setTerm(e.target.value)}
        />
        {term && (
          <button
            type="button"
            className="uai-filter-clear"
            aria-label="Limpar busca"
            onClick={() => setTerm('')}
          >
            <IconX size={14} />
          </button>
        )}
      </span>
    </label>
  )
}
