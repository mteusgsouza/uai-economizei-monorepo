import type { Product, Subcategory } from "@/types/product";

export interface HomeCategory {
  id: number;
  title: string;
  categorySlug: string;
  subcategories: Subcategory[];
  productImage: string | null;
}

export interface HomeBrand {
  id: number;
  name: string;
  productCount: number;
  products: Product[];
}

export interface HomeData {
  hero: Product[];
  newArrivals: Product[];
  categoryProducts: {
    eletronicos: Product[];
    casa: Product[];
  };
  categories: HomeCategory[];
  topBrands: HomeBrand[];
}
