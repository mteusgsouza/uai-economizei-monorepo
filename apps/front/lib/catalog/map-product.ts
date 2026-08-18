import type { Brand as PayloadBrand, Category as PayloadCategory, Product as PayloadProduct } from "@/payload-types"
import type { Brand, CategoryWithSubcategories, Product, ProductImage, Subcategory } from "@/types/product"
import { sellingPrice } from "@/lib/commerce"
import { lexicalToHtml } from "./lexical"

function parseProductImages(value: PayloadProduct["productImages"]): ProductImage[] {
  if (!Array.isArray(value)) return []
  return value.map((img) => ({ name: img.name ?? "", url: img.url }))
}

function toHtml(value: PayloadProduct["description"]): string {
  if (!value) return ""
  return typeof value === "string" ? value : lexicalToHtml(value)
}

function mapBrand(value: PayloadProduct["brand"]): Brand | null {
  if (typeof value !== "object" || value === null) return null
  return { id: value.id, name: value.name }
}

export function mapCategory(value: PayloadCategory): CategoryWithSubcategories {
  return {
    id: value.id,
    title: value.title,
    categorySlug: value.categorySlug,
    image: value.image ?? null,
    subcategories: mapSubcategories(value),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

export function mapSubcategories(category: PayloadCategory): Subcategory[] {
  return (category.subcategories ?? []).map((sub) => ({
    title: sub.title,
    subcatSlug: sub.subcatSlug,
    categoryId: category.id,
  }))
}

export function mapBrandDoc(value: PayloadBrand): Brand {
  return { id: value.id, name: value.name }
}

/**
 * Converte um doc `products` do Payload para o tipo `Product` do site
 * (contrato herdado do Prisma: `value` em vez de `price`, `description_html`).
 * `withDescription` evita a conversão Lexical (cara) em listagens.
 */
export function mapProduct(doc: PayloadProduct, withDescription = false): Product {
  // `value` é o preço já com desconto: carrinho, checkout e a Nest calculam em
  // cima dele, então o abatimento acontece uma vez só, aqui na fronteira.
  const discountPercent = doc.discountPercent ?? 0
  const value = sellingPrice(doc.price, discountPercent)

  const category =
    typeof doc.category === "object" && doc.category !== null
      ? {
          id: doc.category.id,
          title: doc.category.title,
          categorySlug: doc.category.categorySlug,
          image: doc.category.image ?? null,
        }
      : null

  // O produto guarda o slug; o título vive na categoria dona. Com `depth: 0`
  // não há de onde resolver — aí a vitrine cai no slug em vez de mentir.
  const subcategoryTitle =
    typeof doc.category === "object" && doc.category !== null && doc.subcategory
      ? (doc.category.subcategories?.find((sub) => sub.subcatSlug === doc.subcategory)?.title ?? null)
      : null

  return {
    id: doc.id,
    name: doc.name,
    description: null,
    // `description` já é HTML puro; a conversão Lexical só existe para
    // conteúdo legado ainda não migrado.
    description_html: withDescription ? toHtml(doc.description) : undefined,
    active: doc.active ?? false,
    isNew: doc.isNew ?? false,
    paidPrice: doc.paidPrice ?? undefined,
    value,
    listPrice: discountPercent > 0 ? doc.price : null,
    discountPercent,
    pixDiscount: doc.pixDiscount ?? false,
    stock: doc.stock ?? 0,
    productMainImg: doc.productMainImg ?? "",
    productImages: parseProductImages(doc.productImages),
    brand: mapBrand(doc.brand),
    category,
    subcategory: doc.subcategory ?? null,
    subcategoryTitle,
    createdAt: doc.createdAt,
  }
}
