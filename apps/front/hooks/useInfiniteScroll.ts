'use client'

import {
  FetchNextPageOptions,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

type TError = unknown
type TData = unknown

function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  fetchNextPage: (
    options?: FetchNextPageOptions,
  ) => Promise<InfiniteQueryObserverResult<TData, TError>>
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
    const option = { threshold: 0 }
    if (element) {
      const observer = new IntersectionObserver(handleObserver, option)
      observer.observe(element)
      return () => observer.unobserve(element)
    }
  }, [fetchNextPage, hasNextPage, handleObserver])

  return { observerElem }
}

export default useInfiniteScroll
