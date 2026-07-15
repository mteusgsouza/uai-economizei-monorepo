'use query'
import CreateParams from '@/utils/CreateParams'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

function useCreateQuery() {
  const searchParams = useSearchParams()!
  const createQueryString = useCallback(
    (name: string, value: string) => {
      return CreateParams({ name, value, searchParams })
    },
    [searchParams],
  )
  return createQueryString
}

export default useCreateQuery
