import { Injectable, Inject } from '@nestjs/common';
import type { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../auth/firebase-admin.module';
import { syncPrices } from './sync/sync-prices';
import { syncSubcategories } from './sync/sync-subcategories';
import type { SyncResult, SyncSubcategoriesResult } from './sync/sync.types';

export type { SyncResult, SyncSubcategoriesResult } from './sync/sync.types';

/**
 * Sincronizações pontuais Firestore -> Payload. A regra de cada uma vive em
 * `./sync`; aqui só entra a injeção do Firestore e a delegação.
 */
@Injectable()
export class ProductsService {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  syncPricesFromFirebase(): Promise<SyncResult> {
    return syncPrices(this.firestore);
  }

  syncSubcategoriesFromFirebase(): Promise<SyncSubcategoriesResult> {
    return syncSubcategories(this.firestore);
  }
}
