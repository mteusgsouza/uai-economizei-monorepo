import { useQuery } from '@tanstack/react-query'

interface ProductDescriptionDoc {
  id: number
  productId: string
  description?: unknown
  description_html?: string
  features?: unknown
  features_html?: string
  specs?: Record<string, string>
  updatedAt: string
}

/**
 * Busca a descrição rica do produto no Payload CMS.
 * O productId é uma referência externa ao catálogo NestJS.
 */
export function useProductDescription(productId: string) {
  return useQuery({
    queryKey: ['product-description', productId] as const,
    queryFn: async () => {
      const params = new URLSearchParams({ 'where[productId][equals]': productId, 'limit': '1' })
      const res = await fetch(`/api/product-descriptions?${params.toString()}`)
      if (!res.ok) {
        if (res.status === 404) return null
        throw new Error('Falha ao buscar descrição do produto')
      }
      const json = await res.json()
      return (json.docs?.[0] as ProductDescriptionDoc) ?? null
    },
    staleTime: 10 * 60 * 1000,
  })
}
