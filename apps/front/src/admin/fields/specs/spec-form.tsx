'use client'

import { formatLooseSpecValue } from '../../../../lib/specs/format'
import { groupSpecFields } from '../../../../lib/specs/groups'
import type { SpecFieldDef, SpecValue, SpecValues } from '../../../../lib/specs/types'
import { orphanKeys } from '../../../../lib/specs/values'
import { SpecInput } from './spec-input'

interface SpecFormProps {
  fields: SpecFieldDef[]
  commonKeys: Set<string>
  values: SpecValues
  disabled: boolean
  onChange: (key: string, next: SpecValue | null) => void
}

const formatOrphan = (value: SpecValue | undefined) =>
  value === undefined ? '' : formatLooseSpecValue(value)

/** Inputs da ficha agrupados como na página do produto, mais os valores órfãos. */
export function SpecForm({ fields, commonKeys, values, disabled, onChange }: SpecFormProps) {
  const orphans = orphanKeys(values, fields)

  return (
    <>
      {groupSpecFields(fields).map((group) => (
        <fieldset key={group.title ?? ''} className="uai-specs__group">
          {group.title && <legend className="uai-specs__group-title">{group.title}</legend>}
          {group.fields.map((field) => (
            <label key={field.key} className="uai-specs__row">
              <span className="uai-specs__label">
                {field.label}
                {commonKeys.has(field.key) && <span className="uai-specs__tag">da categoria</span>}
              </span>
              <SpecInput
                field={field}
                value={values[field.key]}
                disabled={disabled}
                onChange={(next) => onChange(field.key, next)}
              />
            </label>
          ))}
        </fieldset>
      ))}

      {orphans.length > 0 && (
        <div className="uai-specs__orphans">
          <p className="uai-field-hint">
            Valores que não estão mais no modelo. Não aparecem no site; remova se não servem mais.
          </p>
          {orphans.map((key) => (
            <div key={key} className="uai-specs__orphan">
              <code>{key}</code>
              <span>{formatOrphan(values[key])}</span>
              <button
                type="button"
                className="uai-toggle"
                disabled={disabled}
                onClick={() => onChange(key, null)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
