import type { Firestore } from 'firebase-admin/firestore';
import { normalizeName } from './normalize-name';
import { fetchProductsByName, patchProduct } from './payload-catalog';
import type { SyncResult } from './sync.types';

/**
 * Espelha preço e preço pago do Firestore no Payload. Casa por nome normalizado
 * e converte para centavos, que é como o catálogo guarda valor.
 */
export async function syncPrices(firestore: Firestore): Promise<SyncResult> {
  const result: SyncResult = {
    updated: 0,
    notFound: 0,
    errors: 0,
    details: [],
  };

  const productsByName = await fetchProductsByName();
  const snapshot = await firestore.collection('products').get();

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
    // Passou a casar pelo nome normalizado (antes era só `toLowerCase`): o
    // índice é o mesmo da sincronização de subcategoria, e acento divergente
    // deixava produto de fora.
    const matched = productsByName.get(normalizeName(firebaseName)) ?? [];

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

    try {
      for (const product of matched) {
        await patchProduct(product.id, {
          price: newValue,
          paidPrice: newPaidPrice,
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
