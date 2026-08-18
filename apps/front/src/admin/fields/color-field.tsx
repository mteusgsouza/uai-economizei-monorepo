'use client'

import type { ChangeEvent } from 'react'
import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/** O aço original do design — o que vale quando o campo fica vazio. */
const DEFAULT_ACCENT = '#5980a6'

/**
 * Presets no mesmo peso perceptual do aço original.
 *
 * Não são cores quaisquer: a rampa derivada usa o passo 700 como cor de texto de
 * link, e um tom claro demais ali deixa o link ilegível sobre o fundo claro. Por
 * isso todos ficam na mesma faixa de luminosidade do padrão — trocar o acento
 * reveste a loja sem quebrar a leitura.
 */
const PRESETS: Array<[hex: string, name: string]> = [
  [DEFAULT_ACCENT, 'Aço (padrão)'],
  ['#4f8a7a', 'Verde-mar'],
  ['#4f8a5c', 'Verde'],
  ['#8a7a3f', 'Oliva'],
  ['#a6703f', 'Âmbar'],
  ['#a65959', 'Terracota'],
  ['#8f5a8a', 'Ameixa'],
  ['#5d6470', 'Grafite'],
]

/** Os mesmos passos de `lib/theme.ts`; aqui só para desenhar a prévia. */
const STEPS: Array<[step: number, amount: number, towards: string]> = [
  [100, 8, '#ffffff'],
  [200, 18, '#ffffff'],
  [300, 32, '#ffffff'],
  [400, 50, '#ffffff'],
  [500, 72, '#ffffff'],
  [600, 100, '#ffffff'],
  [700, 78, '#0f1114'],
  [800, 56, '#0f1114'],
  [900, 38, '#0f1114'],
]

/**
 * Campo de cor com a rampa derivada à vista.
 *
 * A loja escolhe um tom só, mas ele vira nove: link, tag, hover, foco e o
 * duotone das fotos saem de passos diferentes da escala. Mostrar a rampa aqui
 * evita a surpresa de escolher um amarelo bonito e descobrir depois que o texto
 * de link ficou ilegível.
 */
export const ColorField: TextFieldClientComponent = ({ field, readOnly }) => {
  const { value, setValue, path, showError, errorMessage, disabled } = useField<string>()

  const locked = Boolean(readOnly) || Boolean(disabled)
  const raw = typeof value === 'string' ? value.trim() : ''
  const valid = /^#[0-9a-f]{6}$/i.test(raw)
  const accent = valid ? raw : DEFAULT_ACCENT

  const update = (next: string) => {
    if (locked) return
    setValue(next.length > 0 ? next : null)
  }

  return (
    <div className="uai-color-field field-type">
      <FieldLabel label={field?.label} path={path} />

      <div className="uai-color-field__controls">
        <input
          type="color"
          className="uai-color-field__swatch"
          value={accent}
          disabled={locked}
          aria-label="Escolher a cor primária"
          onChange={(e: ChangeEvent<HTMLInputElement>) => update(e.target.value)}
        />
        <input
          type="text"
          className="uai-color-field__hex"
          value={raw}
          placeholder={DEFAULT_ACCENT}
          disabled={locked}
          spellCheck={false}
          aria-label="Cor primária em hexadecimal"
          onChange={(e: ChangeEvent<HTMLInputElement>) => update(e.target.value)}
        />
        {raw && (
          <button
            type="button"
            className="uai-toggle"
            disabled={locked}
            onClick={() => update('')}
          >
            Voltar ao padrão
          </button>
        )}
      </div>

      <div className="uai-color-field__presets" role="group" aria-label="Cores sugeridas">
        {PRESETS.map(([hex, name]) => (
          <button
            key={hex}
            type="button"
            className="uai-color-field__preset"
            style={{ background: hex }}
            title={`${name} — ${hex}`}
            aria-label={name}
            aria-pressed={accent.toLowerCase() === hex}
            data-active={accent.toLowerCase() === hex}
            disabled={locked}
            onClick={() => update(hex)}
          />
        ))}
      </div>

      <div className="uai-color-field__ramp" aria-hidden="true">
        {STEPS.map(([step, amount, towards]) => (
          <span
            key={step}
            className="uai-color-field__step"
            title={`accent-${step}`}
            style={{
              background:
                amount === 100
                  ? accent
                  : `color-mix(in oklch, ${accent} ${amount}%, ${towards})`,
            }}
          />
        ))}
      </div>

      <p className="uai-field-hint">
        {raw
          ? 'A escala acima é a que a loja vai usar — do tom mais claro (fundos de etiqueta) ao mais escuro (texto de link).'
          : `Em branco, vale o ${DEFAULT_ACCENT} original do design.`}
      </p>

      <FieldError showError={showError} message={errorMessage} />
      <FieldDescription description={field?.admin?.description} path={path} />
    </div>
  )
}

export default ColorField
