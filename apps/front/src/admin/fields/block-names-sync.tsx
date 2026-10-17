'use client'

import { useEffect } from 'react'
import { useFormFields, useFormInitializing } from '@payloadcms/ui'

import { autoBlockNames } from '../../../lib/pages/block-names'
import { blockNameBase } from '../../blocks'

type Entry = [blockType: string, blockName: string]

/**
 * Campo invisível depois do layout: cada bloco ganha nome assim que entra na
 * página — `video-1`, `video-2`… — e os automáticos são renumerados ao
 * reordenar ou remover. Nome escrito à mão fica.
 *
 * Atualiza o estado do formulário sem marcá-lo como modificado: abrir uma
 * página antiga não pede para salvar à toa, e o servidor completa os nomes no
 * próximo save de qualquer jeito (`fillPageDefaults`).
 */
export function BlockNamesSync() {
  // Em string: o seletor roda a cada tecla no formulário inteiro, e só uma
  // mudança nos tipos ou nomes dos blocos deve disparar o efeito.
  const signature = useFormFields(([fields]) => {
    const rows = fields.layout?.rows ?? []
    const entries: Entry[] = rows.map((row, i) => [
      row.blockType ?? '',
      String(fields[`layout.${i}.blockName`]?.value ?? ''),
    ])
    return JSON.stringify(entries)
  })
  const dispatch = useFormFields(([, dispatchFields]) => dispatchFields)
  // Numa página salva o estado chega do servidor depois da montagem e
  // substitui o que fosse escrito antes — os blocos antigos ficavam sem nome.
  const initializing = useFormInitializing()

  useEffect(() => {
    if (initializing) return
    const entries = JSON.parse(signature) as Entry[]
    const names = autoBlockNames(
      entries.map(([blockType, blockName]) => ({ blockType, blockName })),
      blockNameBase,
    )
    names.forEach((name, i) => {
      if (name !== entries[i]?.[1]) {
        dispatch({ type: 'UPDATE', path: `layout.${i}.blockName`, value: name })
      }
    })
  }, [signature, dispatch, initializing])

  return null
}

export default BlockNamesSync
