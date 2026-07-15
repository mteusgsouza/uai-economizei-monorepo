'use client'
import useCreateQuery from './useCreateQuery'
import usePageParams from './usePageParams'

function useHandleChangeQuery() {
  const { router, pathname } = usePageParams()
  const createQueryString = useCreateQuery()
  const handleChangeQuery = ({
    value,
    label,
  }: {
    value: string
    label: string
  }) => {
    if (value !== '*') {
      return router.push(
        pathname + '?' + createQueryString(label, value.toString()),
        { scroll: false },
      )
    }
    return router.push(pathname + '?' + createQueryString(label, ''), {
      scroll: false,
    })
  }
  return handleChangeQuery
}

export default useHandleChangeQuery
