export interface SyncResult {
  updated: number;
  notFound: number;
  errors: number;
  details: Array<{
    firebaseName: string;
    firebaseValue: number;
    newValue: number;
    status: 'updated' | 'not_found' | 'error';
    matchedIds?: number[];
    error?: string;
  }>;
}

export type SubcategorySyncStatus =
  | 'updated'
  | 'unchanged'
  | 'not_found_in_firestore'
  | 'category_mismatch'
  | 'subcategory_not_found'
  | 'error';

export interface SyncSubcategoriesResult {
  updated: number;
  unchanged: number;
  notFoundInFirestore: number;
  categoryMismatch: number;
  subcategoryNotFound: number;
  errors: number;
  details: Array<{
    firebaseName: string;
    productId: number;
    status: SubcategorySyncStatus;
    subcategory?: string;
    error?: string;
  }>;
}

/** Produto do Payload reduzido ao que a sincronização precisa. */
export interface PayloadProductRef {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
  subcategory: string | null;
}
