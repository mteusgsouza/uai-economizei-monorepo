'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * Dispara `fetchNextPage` quando o elemento sentinela entra na viewport.
 *
 * A assinatura é agnóstica de origem de dados: serve tanto para o
 * `fetchNextPage` do React Query (site público) quanto para server actions
 * (admin do Payload, onde o React Query não está disponível).
 */
function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  fetchNextPage: () => unknown
}) {
  const observerElem = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  useEffect(() => {
    const element = observerElem.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, { threshold: 0 })
    observer.observe(element)
    return () => observer.unobserve(element)
  }, [handleObserver])

  return { observerElem }
}

export default useInfiniteScroll
