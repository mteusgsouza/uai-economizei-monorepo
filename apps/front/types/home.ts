import type { Product, Subcategory } from "@/types/product";

export interface HomeCategory {
  id: number;
  title: string;
  categorySlug: string;
  subcategories: Subcategory[];
  productImage: string | null;
  /** Preço de venda mais baixo da categoria — o "a partir de" da célula. */
  minPrice: number | null;
}

export interface HomeBrand {
  id: number;
  name: string;
  productCount: number;
  products: Product[];
}

export interface HomeData {
  newArrivals: Product[];
  categories: HomeCategory[];
  topBrands: HomeBrand[];
  /** Maior desconto do catálogo, para a régua de estatísticas. */
  maxDiscountPercent: number;
}
