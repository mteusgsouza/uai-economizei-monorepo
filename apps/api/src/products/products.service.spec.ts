import type { Firestore } from 'firebase-admin/firestore';
import { ProductsService } from './products.service';

type FetchCall = [string, RequestInit | undefined];

interface PayloadProductDoc {
  id: number;
  name: string;
  category: number | null;
  subcategory: string | null;
}

function firestoreWith(docs: Array<Record<string, unknown>>): Firestore {
  return {
    collection: () => ({
      get: () =>
        Promise.resolve({ docs: docs.map((data) => ({ data: () => data })) }),
    }),
  } as unknown as Firestore;
}

/** Doc do Firestore no formato que a importação original deixou. */
function firestoreProduct(name: string, category: string, subcategory: string) {
  return { name, category: { category, subcategory } };
}

describe('ProductsService.syncSubcategoriesFromFirebase', () => {
  const categories = {
    docs: [
      {
        id: 1,
        title: 'Automotivo',
        subcategories: [{ title: 'Pneu Aro 14', subcatSlug: 'pneu-aro-14' }],
      },
      {
        id: 2,
        title: 'Informática',
        subcategories: [{ title: 'Monitor', subcatSlug: 'monitor' }],
      },
    ],
  };

  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  /** GET de categorias e produtos sempre ok; o PATCH é configurável. */
  function mockPayload(
    docs: PayloadProductDoc[],
    patch: { ok: boolean; status?: number; body?: string } = { ok: true },
  ) {
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(categories),
        });
      }
      if (!init) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ docs }),
        });
      }
      return Promise.resolve({
        ok: patch.ok,
        status: patch.status,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(patch.body ?? ''),
      });
    });
  }

  function patchCalls(): FetchCall[] {
    return (fetchMock.mock.calls as FetchCall[]).filter(
      ([, init]) => init?.method === 'PATCH',
    );
  }

  function run(firestoreDocs: Array<Record<string, unknown>>) {
    return new ProductsService(
      firestoreWith(firestoreDocs),
    ).syncSubcategoriesFromFirebase();
  }

  it('preenche subcategory quando nome, categoria e subcategoria casam', async () => {
    mockPayload([
      { id: 10, name: 'Pneu Aro 14', category: 1, subcategory: null },
    ]);

    const result = await run([
      firestoreProduct('Pneu Aro 14', 'Automotivo', 'Pneu Aro 14'),
    ]);

    expect(result.updated).toBe(1);
    expect(result.details[0]).toMatchObject({
      productId: 10,
      status: 'updated',
      subcategory: 'pneu-aro-14',
    });

    const [patchUrl, patchInit] = patchCalls()[0];
    expect(patchUrl).toBe('http://localhost:3000/api/products/10');
    expect(JSON.parse(patchInit!.body as string)).toEqual({
      subcategory: 'pneu-aro-14',
    });
  });

  it('casa nomes com acento/caixa diferentes e não repatcheia o que já está certo', async () => {
    mockPayload([
      { id: 11, name: 'MONITOR gamer', category: 2, subcategory: 'monitor' },
    ]);

    const result = await run([
      firestoreProduct('Monitor Gamer', 'Informática', 'Monitor'),
    ]);

    expect(result.unchanged).toBe(1);
    expect(result.updated).toBe(0);
    expect(patchCalls()).toHaveLength(0);
  });

  it('não sobrescreve quando a categoria salva diverge da do Firestore', async () => {
    mockPayload([{ id: 12, name: 'Item X', category: 2, subcategory: null }]);

    const result = await run([
      firestoreProduct('Item X', 'Automotivo', 'Pneu Aro 14'),
    ]);

    expect(result.categoryMismatch).toBe(1);
    expect(result.updated).toBe(0);
  });

  it('marca subcategoryNotFound quando o título não existe na taxonomia', async () => {
    mockPayload([{ id: 13, name: 'Item Y', category: 1, subcategory: null }]);

    const result = await run([
      firestoreProduct('Item Y', 'Automotivo', 'Pneu Aro 99'),
    ]);

    expect(result.subcategoryNotFound).toBe(1);
    expect(result.updated).toBe(0);
  });

  it('conta erro — não "updated" — quando o Payload recusa o PATCH', async () => {
    mockPayload([{ id: 14, name: 'Item Z', category: 1, subcategory: null }], {
      ok: false,
      status: 403,
      body: '{"errors":[{"message":"You are not allowed"}]}',
    });

    const result = await run([
      firestoreProduct('Item Z', 'Automotivo', 'Pneu Aro 14'),
    ]);

    expect(result.updated).toBe(0);
    expect(result.errors).toBe(1);
    expect(result.details[0].error).toContain('403');
  });

  it('marca notFoundInFirestore quando nenhum produto do Payload casa', async () => {
    mockPayload([]);

    const result = await run([
      firestoreProduct('Produto Inexistente', 'Automotivo', 'Pneu Aro 14'),
    ]);

    expect(result.notFoundInFirestore).toBe(1);
  });
});
