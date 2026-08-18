export type PromotionState = 'live' | 'scheduled' | 'ended' | 'off'

export interface PromotionStatus {
  state: PromotionState
  label: string
  /** Frase curta explicando por que está nesse estado. */
  detail: string
}

/**
 * Situação real de uma promoção no carrossel.
 *
 * "Ativa" sozinha não responde a pergunta que interessa: com `startDate` e
 * `endDate` no jogo, uma promoção marcada pode estar esperando a data ou já ter
 * vencido. O storefront filtra pelas três coisas juntas, e é essa combinação que
 * o admin precisa mostrar.
 */
export function promotionStatus(
  active: boolean | null | undefined,
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  now: Date = new Date(),
): PromotionStatus {
  if (!active) {
    return { state: 'off', label: 'Inativa', detail: 'Não entra no carrossel enquanto estiver desmarcada.' }
  }

  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null

  if (start && start > now) {
    return {
      state: 'scheduled',
      label: 'Agendada',
      detail: `Entra no ar em ${formatDate(start)}.`,
    }
  }

  if (end && end < now) {
    return {
      state: 'ended',
      label: 'Encerrada',
      detail: `Saiu do carrossel em ${formatDate(end)}.`,
    }
  }

  if (end) {
    const days = Math.ceil((end.getTime() - now.getTime()) / 86_400_000)
    return {
      state: 'live',
      label: 'No ar',
      detail:
        days <= 1
          ? 'Encerra hoje — depois sai do carrossel sozinha.'
          : `Encerra em ${days} dias — depois sai do carrossel sozinha.`,
    }
  }

  return { state: 'live', label: 'No ar', detail: 'Sem prazo de fim definido.' }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
