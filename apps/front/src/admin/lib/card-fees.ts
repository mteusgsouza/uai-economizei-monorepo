/**
 * Cálculo da tabela de taxas, espelhando `lib/commerce.ts:cardPlans`.
 *
 * A simulação do admin precisa dar exatamente o mesmo número que a página do
 * produto mostra — se divergir em um centavo, a tabela deixa de servir para
 * conferir e passa a enganar. Por isso o arredondamento é o mesmo: o total
 * arredonda primeiro, a parcela depois.
 */
export interface CardPlanPreview {
  total: number
  perInstallment: number
}

export function planPreview(value: number, installments: number, percent: number): CardPlanPreview {
  const parcels = Math.trunc(installments)
  const fee = clampPercent(percent)
  const total = Math.round((value * (100 + fee)) / 100)

  return {
    total,
    perInstallment: parcels >= 1 ? Math.round(total / parcels) : total,
  }
}

/** Acréscimo do cartão. Negativo não existe; o teto evita erro de digitação virar preço. */
export function clampPercent(percent: number | null | undefined): number {
  if (typeof percent !== 'number' || Number.isNaN(percent)) return 0
  return Math.min(Math.max(percent, 0), 100)
}

export type FeeMode = 'progressive' | 'flat'

export interface FeePlan {
  installments: number
  percent: number
}

/**
 * Gera as linhas da tabela.
 *
 * `progressive`: a taxa cresce linearmente da primeira à última parcela — o
 * formato usual das maquininhas, onde 1x custa pouco e 12x custa bem mais.
 * `flat`: a mesma taxa para toda a faixa, para quem negociou preço fechado.
 */
export function buildFeePlans(
  mode: FeeMode,
  from: number,
  to: number,
  startPercent: number,
  endPercent: number,
): FeePlan[] {
  const first = Math.max(1, Math.trunc(from))
  const last = Math.max(first, Math.trunc(to))
  const span = last - first

  return Array.from({ length: span + 1 }, (_, i) => {
    const installments = first + i
    const percent =
      mode === 'flat' || span === 0
        ? clampPercent(startPercent)
        : clampPercent(startPercent + ((endPercent - startPercent) * i) / span)

    // Duas casas: taxa de maquininha vem com uma ou duas (4,1% / 12,75%).
    return { installments, percent: Math.round(percent * 100) / 100 }
  })
}
