'use client'

import { useState } from 'react'

import type { FeeMode } from '../../lib/card-fees'

export interface GeneratorConfig {
  mode: FeeMode
  from: number
  to: number
  startPercent: number
  endPercent: number
}

interface GeneratorProps {
  onApply: (config: GeneratorConfig) => void
  disabled: boolean
}

/**
 * Preenche a tabela de uma vez.
 *
 * Digitar 24 linhas à mão é o que faz essa tela doer. As maquininhas cobram ou
 * uma curva crescente (1x barato, 12x caro) ou uma taxa fechada por faixa —
 * os dois formatos cabem aqui, e a tabela abaixo mostra o resultado antes de salvar.
 */
export function Generator({ onApply, disabled }: GeneratorProps) {
  const [mode, setMode] = useState<FeeMode>('progressive')
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(12)
  const [startPercent, setStartPercent] = useState(0)
  const [endPercent, setEndPercent] = useState(20)

  const progressive = mode === 'progressive'

  return (
    <div className="uai-fees__generator">
      <div className="uai-toggle-group">
        <button
          type="button"
          className="uai-toggle"
          data-active={progressive}
          disabled={disabled}
          onClick={() => setMode('progressive')}
        >
          Progressivo
        </button>
        <button
          type="button"
          className="uai-toggle"
          data-active={!progressive}
          disabled={disabled}
          onClick={() => setMode('flat')}
        >
          Taxa única
        </button>
      </div>

      <label className="uai-fees__control">
        De
        <input
          type="number"
          min={1}
          max={24}
          value={from}
          disabled={disabled}
          onChange={(e) => setFrom(Number(e.target.value))}
        />
        x
      </label>

      <label className="uai-fees__control">
        até
        <input
          type="number"
          min={1}
          max={24}
          value={to}
          disabled={disabled}
          onChange={(e) => setTo(Number(e.target.value))}
        />
        x
      </label>

      <label className="uai-fees__control">
        {progressive ? 'de' : 'com'}
        <input
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={startPercent}
          disabled={disabled}
          onChange={(e) => setStartPercent(Number(e.target.value))}
        />
        %
      </label>

      {progressive && (
        <label className="uai-fees__control">
          a
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={endPercent}
            disabled={disabled}
            onChange={(e) => setEndPercent(Number(e.target.value))}
          />
          %
        </label>
      )}

      <button
        type="button"
        className="uai-toggle uai-fees__apply"
        disabled={disabled}
        onClick={() => onApply({ mode, from, to, startPercent, endPercent })}
      >
        Gerar tabela
      </button>
    </div>
  )
}
