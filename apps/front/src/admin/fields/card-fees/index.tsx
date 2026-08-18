'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FieldDescription, FieldLabel, useField, useForm } from '@payloadcms/ui'
import type { ArrayFieldClientComponent } from 'payload'

import { buildFeePlans, type FeePlan } from '../../lib/card-fees'
import { Generator, type GeneratorConfig } from './generator'
import { RateRow } from './rate-row'

/** Preço usado só na simulação — o mesmo exemplo do comentário da collection. */
const DEFAULT_REFERENCE = 40000

/**
 * Tabela de taxas do cartão.
 *
 * Substitui a pilha de linhas do array padrão: são até 24 parcelamentos, e
 * empilhados eles não deixam ver a curva nem conferir o resultado. Aqui cada
 * linha é uma linha de tabela com uma coluna a mais — quanto o cliente vê —
 * calculada com a mesma conta do site, e há um gerador para preencher a faixa
 * inteira de uma vez.
 */
export const CardFeesTable: ArrayFieldClientComponent = ({ field, readOnly }) => {
  const { path, rows = [], disabled } = useField({ hasRows: true })
  const { addFieldRow, dispatchFields, removeFieldRow, setModified } = useForm()

  const [reference, setReference] = useState(DEFAULT_REFERENCE)
  // O plano pendente mora num ref, não em estado: ele não muda nada na tela por
  // si só — quem redesenha é o próprio formulário quando o número de linhas
  // muda. Em estado, limpá-lo ao terminar seria um `setState` dentro do efeito.
  const pendingRef = useRef<FeePlan[] | null>(null)

  const locked = Boolean(readOnly) || Boolean(disabled)

  const removeRow = useCallback(
    (index: number) => {
      removeFieldRow({ path, rowIndex: index })
      setModified(true)
    },
    [removeFieldRow, path, setModified],
  )

  const addRow = useCallback(() => {
    addFieldRow({ path, rowIndex: rows.length, schemaPath: field?.name ?? 'rates' })
    setModified(true)
  }, [addFieldRow, field?.name, path, rows.length, setModified])

  /**
   * Acerta a tabela em direção ao plano pendente, um passo por vez.
   *
   * Adicionar e remover linha passam pelo estado do formulário, que só reflete
   * na próxima renderização — não dá para criar 12 linhas e escrever os valores
   * na mesma passada. Cada chamada dá um passo (uma linha a mais ou a menos) e
   * o efeito abaixo reexecuta quando `rows.length` muda, até bater o tamanho.
   * Aí os valores são escritos de uma vez e o plano se encerra.
   */
  const reconcile = useCallback(() => {
    const pending = pendingRef.current
    if (!pending) return

    if (rows.length < pending.length) {
      addFieldRow({ path, rowIndex: rows.length, schemaPath: field?.name ?? 'rates' })
      return
    }

    if (rows.length > pending.length) {
      removeFieldRow({ path, rowIndex: rows.length - 1 })
      return
    }

    pending.forEach((plan, index) => {
      dispatchFields({
        type: 'UPDATE',
        path: `${path}.${index}.installments`,
        value: plan.installments,
      })
      dispatchFields({ type: 'UPDATE', path: `${path}.${index}.percent`, value: plan.percent })
    })
    setModified(true)
    pendingRef.current = null
  }, [rows.length, addFieldRow, removeFieldRow, dispatchFields, path, field?.name, setModified])

  useEffect(() => {
    reconcile()
  }, [reconcile])

  const applyGenerator = useCallback(
    (config: GeneratorConfig) => {
      pendingRef.current = buildFeePlans(
        config.mode,
        config.from,
        config.to,
        config.startPercent,
        config.endPercent,
      )
      reconcile()
    },
    [reconcile],
  )

  return (
    <div className="uai-fees field-type">
      <FieldLabel label={field?.label} path={path} />
      <FieldDescription description={field?.admin?.description} path={path} />

      <Generator onApply={applyGenerator} disabled={locked} />

      <div className="uai-fees__reference">
        <label>
          Simular sobre
          <input
            type="number"
            min={0}
            step={100}
            value={reference}
            disabled={locked}
            onChange={(e) => setReference(Number(e.target.value))}
          />
          centavos
        </label>
        <span className="uai-field-hint">
          Só para conferir aqui — não altera nada do que é salvo.
        </span>
      </div>

      <div className="uai-fees__scroll">
        <table className="uai-fees__table">
          <thead>
            <tr>
              <th>Parcelas</th>
              <th>Acréscimo</th>
              <th>O cliente vê</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <RateRow
                key={row.id ?? index}
                basePath={path}
                index={index}
                reference={reference}
                onRemove={removeRow}
                disabled={locked}
              />
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="uai-empty">
          Sem nenhuma linha, a tabela some da página do produto.
        </p>
      )}

      <button type="button" className="uai-fees__add" disabled={locked} onClick={addRow}>
        + Adicionar parcelamento
      </button>
    </div>
  )
}

export default CardFeesTable
