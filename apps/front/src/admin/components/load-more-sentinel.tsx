'use client'

interface LoadMoreSentinelProps {
  ref: React.RefObject<HTMLDivElement | null>
  loading: boolean
  hasNextPage: boolean
  loaded: number
  total: number
  error?: string
}

/**
 * Rodapé das listas com scroll infinito: é o alvo do IntersectionObserver e
 * mostra em que ponto da lista o usuário está.
 */
export function LoadMoreSentinel({
  ref,
  loading,
  hasNextPage,
  loaded,
  total,
  error,
}: LoadMoreSentinelProps) {
  return (
    <div ref={ref} className="uai-load-more">
      {error ? (
        <span className="uai-load-more-error">{error}</span>
      ) : loading ? (
        <span>Carregando…</span>
      ) : hasNextPage ? (
        <span>
          {loaded} de {total}
        </span>
      ) : (
        <span>
          {loaded} {loaded === 1 ? 'registro' : 'registros'}
        </span>
      )}
    </div>
  )
}
