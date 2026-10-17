'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'

import { relationId } from '../../../../lib/relation-id'
import type { SpecValue, SpecValues } from '../../../../lib/specs/types'
import { parseSpecValues, setSpecValue } from '../../../../lib/specs/values'
import { SpecForm } from './spec-form'
import { modelsForSubcategory, useCategoryModels } from './use-category-models'
import { useProductTaxonomy } from './use-product-taxonomy'
import { useSpecFields } from './use-spec-fields'

/**
 * Ficha técnica do produto. Os campos não são fixos no código: vêm do modelo
 * escolhido em `specTemplate` mais os campos comuns da categoria, e os valores
 * ficam num JSON indexado pela chave de cada campo. A troca automática do
 * modelo mora em `SpecTemplateSync`, na aba onde a categoria muda.
 */
export const SpecsField: JSONFieldClientComponent = ({ field, readOnly }) => {
  const { value, setValue, path, disabled } = useField<SpecValues | null>()
  const template = useField<number | string | null>({ path: 'specTemplate' })
  const { categoryId, subcategory } = useProductTaxonomy()

  const templateId = relationId(template.value)
  const locked = Boolean(readOnly) || Boolean(disabled)

  const suggestions = modelsForSubcategory(useCategoryModels(categoryId), subcategory)
  const { fields, commonKeys, loading } = useSpecFields(templateId, categoryId)
  const values = parseSpecValues(value)

  function change(key: string, next: SpecValue | null) {
    const updated = setSpecValue(values, key, next)
    setValue(Object.keys(updated).length > 0 ? updated : null)
  }

  return (
    <div className="uai-specs field-type">
      <FieldLabel label={field?.label} path={path} />

      {templateId === null && suggestions.length > 0 && (
        <div className="uai-specs__suggestions">
          <span className="uai-field-hint">Sugerido para esta subcategoria:</span>
          {suggestions.map((model) => (
            <button
              key={model.id}
              type="button"
              className="uai-toggle"
              disabled={locked}
              onClick={() => template.setValue(model.id)}
            >
              Usar {model.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="uai-field-hint">Carregando campos…</p>
      ) : fields.length === 0 ? (
        <p className="uai-field-hint">
          Escolha o modelo da ficha técnica acima. Os modelos são criados em
          “Modelos de ficha técnica”.
        </p>
      ) : null}

      {!loading && (
        <SpecForm
          fields={fields}
          commonKeys={commonKeys}
          values={values}
          disabled={locked}
          onChange={change}
        />
      )}
    </div>
  )
}

export default SpecsField
