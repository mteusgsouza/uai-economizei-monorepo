export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  title: string;
  categorySlug: string;
}

export interface ProductImage {
  name: string;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  isNew: string | null;
  value: number;
  stock: number;
  productMainImg: string;
  productImages: ProductImage[];
  brand: Brand;
  category: Category;
  createdAt?: string;
}
