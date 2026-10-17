'use client'

import { useEffect, useState, type InputHTMLAttributes } from 'react'

type DraftInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  /** Valor guardado, já em texto. */
  text: string
  /** O rascunho ainda representa o valor guardado? */
  matches: (draft: string) => boolean
  onCommit: (draft: string) => void
  /** Marca o rascunho que não vira valor (ex.: letra num campo de número). */
  invalid?: (draft: string) => boolean
}

/**
 * Input que mostra o que a pessoa digitou, não o valor já limpo. Sem isso o
 * espaço no fim de "Ryzen " sumiria antes do "5", e "15," viraria "15" antes
 * da casa decimal. Só se ressincroniza quando o valor muda por fora.
 */
export function DraftInput({ text, matches, onCommit, invalid, ...props }: DraftInputProps) {
  const [draft, setDraft] = useState(text)

  useEffect(() => {
    setDraft((current) => (matches(current) ? current : text))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reage só ao valor guardado
  }, [text])

  return (
    <input
      {...props}
      aria-invalid={invalid?.(draft) || undefined}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value)
        onCommit(event.target.value)
      }}
    />
  )
}
