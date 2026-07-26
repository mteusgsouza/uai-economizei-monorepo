import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { QueryProductDto } from './dto/query-product.dto';
import type { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../auth/firebase-admin.module';

const PAYLOAD_API = 'http://localhost:3000/api';

/** Converte Lexical JSON (ou array de parágrafos) para string HTML */
function lexicalToHtml(input: unknown): string {
  if (!input) return '';
  if (typeof input === 'string') return input;

  // Payload richText: { root: { children: [...] } }
  const root = (input as Record<string, unknown>).root as
    | Record<string, unknown>
    | undefined;
  const children = (root?.children ?? (input as Array<unknown>)) as Array<
    Record<string, unknown>
  >;

  if (!Array.isArray(children)) return '';

  return children
    .map((node) => {
      if (node.type === 'paragraph' || node.type === 'heading') {
        const text = (node.children as Array<Record<string, unknown>>)
          ?.map((c) => String(c.text ?? ''))
          .join('');
        // Se o texto já é HTML (começa com <), retorna direto sem wrap extra
        if (text.startsWith('<')) return text;
        return node.type === 'heading' ? `<h3>${text}</h3>` : `<p>${text}</p>`;
      }
      return '';
    })
    .join('\n');
}

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

  private mapProduct(p: Record<string, unknown>) {
    // Payload usa "price", frontend espera "value" (herdado do Prisma)
    if (p.price !== undefined) {
      p.value = p.price;
      delete p.price;
    }
    // Converte richText Lexical → HTML para o frontend
    if (p.description) {
      p.description_html = lexicalToHtml(p.description);
    }
    return p;
  }

  /** Mapeamento leve — renomeia price→value, mas pula a conversão Lexical (cara) */
  private mapProductLight(p: Record<string, unknown>) {
    if (p.price !== undefined) {
      p.value = p.price;
      delete p.price;
    }
    return p;
  }

  async findAllPublic(query: QueryProductDto = {}) {
    const params = new URLSearchParams();
    params.set('depth', '1');

    const limit = query.limit ?? 50;
    params.set('limit', String(limit));
    if (query.page) params.set('page', String(query.page));

    // Filtros diretos (Payload suporta nativamente)
    params.set('where[active][equals]', 'true');

    if (query.search) {
      params.set('where[name][like]', query.search.trim());
    }

    if (query.precoMin !== undefined) {
      params.set('where[price][greater_than_equal]', String(query.precoMin));
    }

    if (query.precoMax !== undefined) {
      params.set('where[price][less_than_equal]', String(query.precoMax));
    }

    if (query.inStock) {
      params.set('where[stock][greater_than]', '0');
    }

    if (query.isNew && query.isNew !== 'false') {
      params.set('where[isNew][not_equals]', 'false');
    }

    if (query.categoryId) {
      params.set('where[category][equals]', String(query.categoryId));
    }

    // Filtros que precisam resolver relacionamento primeiro (two-step lookup)
    // Paraleliza os lookups quando ambos brandName e categorySlug estão presentes
    if (query.brandName && query.categorySlug) {
      const [brandRes, catRes] = await Promise.all([
        fetch(
          `${PAYLOAD_API}/brands?where[name][like]=${encodeURIComponent(query.brandName)}&limit=100`,
        ),
        fetch(
          `${PAYLOAD_API}/categories?where[categorySlug][equals]=${encodeURIComponent(query.categorySlug)}&limit=1`,
        ),
      ]);
      const brandData = await brandRes.json();
      const brandIds = (brandData.docs as Array<{ id: number }>).map((b) =>
        String(b.id),
      );
      if (brandIds.length === 0) return [];
      params.set('where[brand][in]', brandIds.join(','));

      const catData = await catRes.json();
      const catId = (catData.docs as Array<{ id: number }>)[0]?.id;
      if (!catId) return [];
      params.set('where[category][equals]', String(catId));
    } else if (query.brandName) {
      const brandRes = await fetch(
        `${PAYLOAD_API}/brands?where[name][like]=${encodeURIComponent(query.brandName)}&limit=100`,
      );
      const brandData = await brandRes.json();
      const brandIds = (brandData.docs as Array<{ id: number }>).map((b) =>
        String(b.id),
      );
      if (brandIds.length === 0) return [];
      params.set('where[brand][in]', brandIds.join(','));
    } else if (query.brandId) {
      params.set('where[brand][equals]', String(query.brandId));
    }

    if (query.categorySlug) {
      const catRes = await fetch(
        `${PAYLOAD_API}/categories?where[categorySlug][equals]=${encodeURIComponent(query.categorySlug)}&limit=1`,
      );
      const catData = await catRes.json();
      const catId = (catData.docs as Array<{ id: number }>)[0]?.id;
      if (!catId) return [];
      params.set('where[category][equals]', String(catId));
    }

    if (query.subcategoryId) {
      params.set('where[subcategoryId][equals]', String(query.subcategoryId));
    }

    // Ordenação: aceita formato Payload direto ("-createdAt") ou antigo (sortBy + sortOrder)
    if (query.sort) {
      params.set('sort', query.sort);
    } else {
      let sortField = '-createdAt';
      if (query.sortBy === 'name') {
        sortField = query.sortOrder === 'desc' ? '-name' : 'name';
      } else if (query.sortBy === 'value') {
        sortField = query.sortOrder === 'desc' ? '-price' : 'price';
      } else if (query.sortBy === 'stock') {
        sortField = query.sortOrder === 'desc' ? '-stock' : 'stock';
      }
      params.set('sort', sortField);
    }

    const res = await fetch(`${PAYLOAD_API}/products?${params.toString()}`);
    if (!res.ok) throw new Error(`Payload API error: ${res.status}`);

    const data = await res.json();
    return (data.docs as Array<Record<string, unknown>>).map((p) =>
      this.mapProduct(p),
    );
  }

  async findOnePublic(id: number) {
    const res = await fetch(`${PAYLOAD_API}/products/${id}?depth=1`);
    if (!res.ok) throw new NotFoundException(`Product #${id} not found`);

    const product = (await res.json()) as Record<string, unknown>;

    if (!product.active)
      throw new NotFoundException(`Product #${id} not found`);

    return this.mapProduct(product);
  }

  async getHomeData() {
    // Etapa 1: buscar categorias
    const catRes = await fetch(
      `${PAYLOAD_API}/categories?depth=1&limit=0&sort=title`,
    );

    const catData = await catRes.json();
    const allCategories = catData.docs as Array<Record<string, unknown>>;

    // Etapa 2: resolver slugs de categorias para IDs
    const eletronicosCat = allCategories.find(
      (c) => c.categorySlug === 'eletronicos',
    );
    const casaCat = allCategories.find((c) => c.categorySlug === 'casa');

    const eletronicosCatId = eletronicosCat?.id as number | undefined;
    const casaCatId = casaCat?.id as number | undefined;

    // Etapa 3: buscar todos os conjuntos de produtos em paralelo
    const productFetches: Array<
      Promise<{ ok: boolean; json: () => Promise<unknown> }>
    > = [
      // hero: 6 produtos mais recentes
      fetch(
        `${PAYLOAD_API}/products?depth=1&limit=6&sort=-createdAt&where[active][equals]=true`,
      ),
      // newArrivals: 4 produtos com isNew=true
      fetch(
        `${PAYLOAD_API}/products?depth=1&limit=4&sort=-createdAt&where[active][equals]=true&where[isNew][not_equals]=false`,
      ),
      // eletronicos: 4 produtos da categoria
      eletronicosCatId !== undefined
        ? fetch(
            `${PAYLOAD_API}/products?depth=1&limit=4&sort=-createdAt&where[active][equals]=true&where[category][equals]=${eletronicosCatId}`,
          )
        : Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ docs: [] }),
          }),
      // casa: 4 produtos da categoria
      casaCatId !== undefined
        ? fetch(
            `${PAYLOAD_API}/products?depth=1&limit=4&sort=-createdAt&where[active][equals]=true&where[category][equals]=${casaCatId}`,
          )
        : Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ docs: [] }),
          }),
      // batch: produtos para agregação server-side (marcas + imagens de categorias)
      fetch(
        `${PAYLOAD_API}/products?depth=1&limit=200&sort=-createdAt&where[active][equals]=true`,
      ),
    ];

    const [heroRes, newRes, eletronicosRes, casaRes, batchRes] =
      await Promise.all(productFetches);

    const heroProducts = (
      (await heroRes.json()) as { docs: Array<Record<string, unknown>> }
    ).docs.map((p) => this.mapProductLight(p));
    const newProducts = (
      (await newRes.json()) as { docs: Array<Record<string, unknown>> }
    ).docs.map((p) => this.mapProductLight(p));
    const eletronicosProducts = (
      (await eletronicosRes.json()) as { docs: Array<Record<string, unknown>> }
    ).docs.map((p) => this.mapProductLight(p));
    const casaProducts = (
      (await casaRes.json()) as { docs: Array<Record<string, unknown>> }
    ).docs.map((p) => this.mapProductLight(p));
    const batchProducts = (
      (await batchRes.json()) as { docs: Array<Record<string, unknown>> }
    ).docs.map((p) => this.mapProductLight(p));

    // Etapa 4: agregação server-side — agrupar por marca, top 4 por contagem
    const brandMap = new Map<
      number,
      {
        brand: Record<string, unknown>;
        products: Array<Record<string, unknown>>;
      }
    >();
    for (const p of batchProducts) {
      const brand = p.brand as Record<string, unknown> | undefined;
      const brandId = brand?.id as number | undefined;
      if (!brandId) continue;
      if (!brandMap.has(brandId)) {
        brandMap.set(brandId, { brand: brand!, products: [] });
      }
      const entry = brandMap.get(brandId)!;
      if (entry.products.length < 8) {
        entry.products.push(p);
      }
    }

    const topBrands = [...brandMap.entries()]
      .sort((a, b) => b[1].products.length - a[1].products.length)
      .slice(0, 4)
      .map(([id, { brand, products }]) => ({
        id,
        name: brand.name,
        productCount: brandMap.get(id)!.products.length,
        products,
      }));

    // Etapa 5: agregação server-side — uma imagem de produto por categoria
    const categories = allCategories.map((cat) => {
      const c = cat;
      const match = batchProducts.find((p) => {
        const pc = p.category as Record<string, unknown> | undefined;
        return pc?.id === c.id && p.productMainImg;
      });
      return {
        id: c.id,
        title: c.title,
        categorySlug: c.categorySlug,
        subcategories: c.subcategories ?? [],
        productImage: match?.productMainImg ?? c.image ?? null,
      };
    });

    return {
      hero: heroProducts,
      newArrivals: newProducts,
      categoryProducts: {
        eletronicos: eletronicosProducts,
        casa: casaProducts,
      },
      categories,
      topBrands,
    };
  }

  async syncPricesFromFirebase(): Promise<SyncResult> {
    const result: SyncResult = {
      updated: 0,
      notFound: 0,
      errors: 0,
      details: [],
    };

    // Fetch all products from Payload to build a name index
    const allRes = await fetch(`${PAYLOAD_API}/products?limit=0&depth=0`);
    const allData = await allRes.json();
    const allProducts = allData.docs as Array<{
      id: number;
      name: string;
      price: number;
      value: number;
    }>;

    const nameIndex = new Map<string, Array<{ id: number; value: number }>>();
    for (const p of allProducts) {
      const key = (p.name ?? '').toLowerCase();
      if (!nameIndex.has(key)) nameIndex.set(key, []);
      // Payload retorna "price", não "value"
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
