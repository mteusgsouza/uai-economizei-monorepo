export interface Brand {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  title: string;
  subcatSlug: string;
  categoryId: number;
}

export interface Category {
  id: number;
  title: string;
  categorySlug: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
  createdAt?: string;
  updatedAt?: string;
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
  paidPrice?: number;
  value: number;
  stock: number;
  productMainImg: string;
  productImages: ProductImage[];
  brand: Brand;
  category: Category;
  createdAt?: string;
}
