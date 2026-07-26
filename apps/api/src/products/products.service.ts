import { Injectable, Inject } from '@nestjs/common';
import type { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../auth/firebase-admin.module';

const PAYLOAD_API = process.env.PAYLOAD_API_URL ?? 'http://localhost:3000/api';

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

@Injectable()
export class ProductsService {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async syncPricesFromFirebase(): Promise<SyncResult> {
    const result: SyncResult = {
      updated: 0,
      notFound: 0,
      errors: 0,
      details: [],
    };

    // Índice por nome de todos os produtos do Payload
    const allRes = await fetch(`${PAYLOAD_API}/products?limit=0&depth=0`);
    const allData = (await allRes.json()) as {
      docs: Array<{ id: number; name: string; price: number }>;
    };

    const nameIndex = new Map<string, Array<{ id: number; value: number }>>();
    for (const p of allData.docs) {
      const key = (p.name ?? '').toLowerCase();
      if (!nameIndex.has(key)) nameIndex.set(key, []);
      nameIndex.get(key)!.push({ id: p.id, value: p.price });
    }

    const snapshot = await this.firestore.collection('products').get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const firebaseName = data.name as string;
      const firebaseValue = Number(data.value ?? 0);
      const firebasePaidPrice = Number(data.paidPrice ?? 0);

      if (!firebaseName) {
        result.errors++;
        result.details.push({
          firebaseName: '(sem nome)',
          firebaseValue,
          newValue: 0,
          status: 'error',
          error: "Documento sem campo 'name'",
        });
        continue;
      }

      const newValue = Math.round(firebaseValue * 100);
      const newPaidPrice = Math.round(firebasePaidPrice * 100);

      try {
        const matched = nameIndex.get(firebaseName.toLowerCase()) ?? [];

        if (matched.length === 0) {
          result.notFound++;
          result.details.push({
            firebaseName,
            firebaseValue,
            newValue,
            status: 'not_found',
          });
          continue;
        }

        for (const product of matched) {
          await fetch(`${PAYLOAD_API}/products/${product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: newValue, paidPrice: newPaidPrice }),
          });
        }

        result.updated += matched.length;
        result.details.push({
          firebaseName,
          firebaseValue,
          newValue,
          status: 'updated',
          matchedIds: matched.map((p) => p.id),
        });
      } catch (err: unknown) {
        result.errors++;
        result.details.push({
          firebaseName,
          firebaseValue,
          newValue,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return result;
  }
}
