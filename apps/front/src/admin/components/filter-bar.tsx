'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useFilterNavigation } from '../lib/use-filter-navigation'

export { FilterSearch } from './filter-search'

interface Option {
  value: string
  label: string
}

export function FilterSelect({
  label,
  paramKey,
  value,
  options,
}: {
  label: string
  paramKey: string
  value?: string
  options: Option[]
}) {
  const navigate = useFilterNavigation()

  return (
    <label className="uai-filter-field">
      <span className="uai-filter-label">{label}</span>
      <select
        className="uai-filter-select"
        value={value ?? ''}
        onChange={(e) => navigate(paramKey, e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Select único que grava `sortBy` e `sortOrder` de uma vez. */
export function SortSelect({ value, options }: { value: string; options: Option[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const onChange = (next: string) => {
    const [sortBy, sortOrder] = next.split(':')
    const params = new URLSearchParams(searchParams?.toString())
    params.set('sortBy', sortBy ?? '')
    params.set('sortOrder', sortOrder ?? 'desc')
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <label className="uai-filter-field">
      <span className="uai-filter-label">Ordenar por</span>
      <select
        className="uai-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="uai-filter-bar">{children}</div>
}
