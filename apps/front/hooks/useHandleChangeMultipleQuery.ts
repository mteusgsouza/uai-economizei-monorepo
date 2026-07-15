'use client'
import usePageParams from './usePageParams'

type TypeParams = {
  value: string
  label: string
}

function useHandleChangeMultipleQuery() {
  const { router, pathname } = usePageParams()
  const handleChangeQuery = (props: TypeParams[]) => {
    const params = new URLSearchParams()
    props.forEach((element) => {
      params.set(element.label, element.value)
    })
    const url = params.toString()
    return router.push(pathname + '?' + url, { scroll: false })
  }
  return handleChangeQuery
}

export default useHandleChangeMultipleQuery
