'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { FieldLabel, TextInput, useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

import { slugify, slugifyTyping } from '../../../lib/slugify'

/** Espera a pessoa parar de digitar o título antes de reescrever o endereço. */
const DEBOUNCE_MS = 400

/**
 * Endereço da página. Numa página nova ele acompanha o título (com debounce)
 * até a pessoa mexer nele — aí vale o que ela escreveu, para poder encurtar um
 * título longo. Página já salva nunca muda sozinha: o link pode estar
 * circulando; "Usar o título" reaplica quando ela quiser.
 */
export const SlugField: TextFieldClientComponent = ({ field, readOnly }) => {
  const { value, setValue, path, showError, errorMessage, disabled } = useField<string>()
  const title = useFormFields(([fields]) => fields.title?.value)
  const { id } = useDocumentInfo()
  const [touched, setTouched] = useState(false)

  const slug = value ?? ''
  const titleSlug = slugify(typeof title === 'string' ? title : '')
  const following = !id && !touched
  const locked = Boolean(readOnly) || Boolean(disabled)

  useEffect(() => {
    if (!following || titleSlug === slug) return
    const timer = setTimeout(() => setValue(titleSlug), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [following, titleSlug, slug, setValue])

  const finalSlug = slugify(slug)

  return (
    <div className="field-type text uai-slug-field">
      <FieldLabel label={field?.label} required={field?.required} path={path} />
      <TextInput
        path={path}
        value={slug}
        readOnly={locked}
        showError={showError}
        Error={errorMessage ? <div className="field-error">{errorMessage}</div> : undefined}
        placeholder="ex.: trocas-e-devolucoes"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setTouched(true)
          setValue(slugifyTyping(e.target.value))
        }}
      />
      <div className="uai-slug-field__meta">
        <span className="uai-field-hint">
          {finalSlug ? (
            <>
              Na loja: <strong>/{finalSlug}</strong>
            </>
          ) : (
            'O endereço aparece aqui quando você digitar o título.'
          )}
        </span>
        {!locked && !following && titleSlug && titleSlug !== finalSlug && (
          <button
            type="button"
            className="uai-toggle"
            onClick={() => {
              setTouched(false)
              setValue(titleSlug)
            }}
          >
            Usar o título
          </button>
        )}
      </div>
      {typeof field?.admin?.description === 'string' && (
        <p className="uai-field-hint">{field.admin.description}</p>
      )}
    </div>
  )
}

export default SlugField
