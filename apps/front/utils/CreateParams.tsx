import { ReadonlyURLSearchParams } from 'next/navigation'

export default function CreateParams({
  name,
  value,
  searchParams,
}: {
  name: string
  value: string
  searchParams: ReadonlyURLSearchParams
}) {
  const params = new URLSearchParams(searchParams.toString())
  if (value) {
    params.set(name, value)
  } else {
    params.delete(name)
  }
  // Qualquer mudança de filtro/ordenação volta para a primeira página
  if (name !== 'page') params.delete('page')
  return params.toString()
}
