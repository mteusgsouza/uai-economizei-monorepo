export interface Brand {
  id: number
  name: string
}

export interface Subcategory {
  title: string
  subcatSlug: string
  categoryId: number
}

export interface Category {
  id: number
  title: string
  categorySlug: string
  image?: string | null
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductImage {
  name: string
  url: string
}

export interface Product {
  id: number
  name: string
  description: string | null
  description_html?: string | null
  active: boolean
  isNew: string | null
  paidPrice?: number
  /** Preço cobrado, já com o desconto do produto abatido. */
  value: number
  /** Preço cheio, só quando há desconto — é o valor riscado na vitrine. */
  listPrice: number | null
  discountPercent: number
  /** O produto entra no desconto à vista do PIX. */
  pixDiscount: boolean
  stock: number
  productMainImg: string
  productImages: ProductImage[]
  brand: Brand | null
  category: Category | null
  /** `subcatSlug` da subcategoria — é o que vai para a URL de filtro. */
  subcategory?: string | null
  /** Título legível da subcategoria, resolvido na categoria dona. */
  subcategoryTitle?: string | null
  createdAt?: string
}
