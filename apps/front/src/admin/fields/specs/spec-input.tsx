'use client'

import type { SpecFieldDef, SpecValue } from '../../../../lib/specs/types'
import { parseDecimal } from '../../../../lib/specs/values'
import { DraftInput } from './draft-input'

interface SpecInputProps {
  field: SpecFieldDef
  value: SpecValue | undefined
  disabled: boolean
  onChange: (next: SpecValue | null) => void
}

const asText = (value: SpecValue | undefined) => (value === undefined ? '' : String(value))

/** Número com vírgula, como o lojista digita. */
const asDecimal = (value: SpecValue | undefined) =>
  typeof value === 'number' ? String(value).replace('.', ',') : asText(value)

function BooleanInput({ field, value, disabled, onChange }: SpecInputProps) {
  const current = value === true ? 'sim' : value === false ? 'nao' : ''
  return (
    <select
      className="uai-specs__control"
      aria-label={field.label}
      value={current}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value === 'sim')}
    >
      <option value="">—</option>
      <option value="sim">Sim</option>
      <option value="nao">Não</option>
    </select>
  )
}

function OptionsInput({ field, value, disabled, onChange }: SpecInputProps) {
  const current = asText(value)
  // Valor que saiu da lista do modelo continua visível até alguém trocar
  const options = current && !field.options.includes(current) ? [current, ...field.options] : field.options
  return (
    <select
      className="uai-specs__control"
      aria-label={field.label}
      value={current}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">—</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function NumberInput({ field, value, disabled, onChange }: SpecInputProps) {
  const stored = typeof value === 'number' ? value : null
  return (
    <span className="uai-specs__number">
      <DraftInput
        className="uai-specs__control"
        aria-label={field.label}
        inputMode="decimal"
        disabled={disabled}
        text={asDecimal(value)}
        matches={(draft) => parseDecimal(draft) === stored}
        onCommit={(draft) => onChange(parseDecimal(draft))}
        invalid={(draft) => draft.trim() !== '' && parseDecimal(draft) === null}
      />
      {field.unit && <span className="uai-specs__unit">{field.unit}</span>}
    </span>
  )
}

/** Input certo para o tipo do campo definido no modelo. */
export function SpecInput(props: SpecInputProps) {
  const { field, value, disabled, onChange } = props
  if (field.type === 'boolean') return <BooleanInput {...props} />
  if (field.type === 'select') return <OptionsInput {...props} />
  if (field.type === 'number') return <NumberInput {...props} />

  return (
    <DraftInput
      className="uai-specs__control uai-specs__control--wide"
      aria-label={field.label}
      disabled={disabled}
      text={asText(value)}
      matches={(draft) => draft.trim() === asText(value)}
      onCommit={(draft) => onChange(draft)}
    />
  )
}
