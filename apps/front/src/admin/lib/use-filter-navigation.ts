'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * Grava um filtro na query string. A URL é a fonte da verdade dos filtros:
 * o recorte fica compartilhável e sobrevive ao recarregar.
 */
export function useFilterNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // O recorte mudou: a página anterior pode nem existir mais
      params.delete('page')
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )
}
