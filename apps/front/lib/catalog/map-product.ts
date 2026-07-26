import type {
  Brand as PayloadBrand,
  Category as PayloadCategory,
  Product as PayloadProduct,
} from "@/payload-types";
import type {
  Brand,
  CategoryWithSubcategories,
  Product,
  ProductImage,
  Subcategory,
} from "@/types/product";
import { lexicalToHtml } from "./lexical";

function parseProductImages(value: PayloadProduct["productImages"]): ProductImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (img): img is ProductImage =>
      typeof img === "object" &&
      img !== null &&
      typeof (img as ProductImage).url === "string",
  );
}

function mapBrand(value: PayloadProduct["brand"]): Brand | null {
  if (typeof value !== "object" || value === null) return null;
  return { id: value.id, name: value.name };
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
  };
}

export function mapSubcategories(category: PayloadCategory): Subcategory[] {
  return (category.subcategories ?? []).map((sub, index) => ({
    id: sub.id != null && Number.isFinite(Number(sub.id)) ? Number(sub.id) : index,
    title: sub.title,
    subcatSlug: sub.subcatSlug,
    categoryId: category.id,
  }));
}

export function mapBrandDoc(value: PayloadBrand): Brand {
  return { id: value.id, name: value.name };
}

/**
 * Converte um doc `products` do Payload para o tipo `Product` do site
 * (contrato herdado do Prisma: `value` em vez de `price`, `description_html`).
 * `withDescription` evita a conversão Lexical (cara) em listagens.
 */
export function mapProduct(doc: PayloadProduct, withDescription = false): Product {
  const category =
    typeof doc.category === "object" && doc.category !== null
      ? {
          id: doc.category.id,
          title: doc.category.title,
          categorySlug: doc.category.categorySlug,
          image: doc.category.image ?? null,
        }
      : null;

  return {
    id: doc.id,
    name: doc.name,
    description: null,
    description_html: withDescription ? lexicalToHtml(doc.description) : undefined,
    active: doc.active ?? false,
    isNew: doc.isNew ?? null,
    paidPrice: doc.paidPrice ?? undefined,
    value: doc.price,
    stock: doc.stock ?? 0,
    productMainImg: doc.productMainImg ?? "",
    productImages: parseProductImages(doc.productImages),
    brand: mapBrand(doc.brand),
    category,
    subcategoryId: doc.subcategoryId ?? null,
    createdAt: doc.createdAt,
  };
}
