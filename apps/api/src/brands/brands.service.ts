import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBrandDto } from './dto/query-brand.dto';

const PAYLOAD_API = 'http://localhost:3000/api';

@Injectable()
export class BrandsService {
  async findAll(query: QueryBrandDto = {}) {
    const params = new URLSearchParams();
    params.set('limit', '0');

    if (query.search) {
      params.set('where[name][like]', query.search);
    }

    const sortField = query.sortOrder === 'asc' ? 'name' : '-name';
    params.set('sort', sortField);

    // categorySlug filter: busca produtos da categoria, extrai brand IDs, filtra
    if (query.categorySlug) {
      const prodRes = await fetch(
        `${PAYLOAD_API}/products?where[category][categorySlug][equals]=${encodeURIComponent(query.categorySlug)}&limit=0&depth=0`,
      );
      if (!prodRes.ok) return [];
      const prodData = await prodRes.json();
      const brandIds = [
        ...new Set(
          (prodData.docs as Array<{ brand: number }>).map((p) => p.brand),
        ),
      ];
      if (brandIds.length === 0) return [];
      brandIds.forEach((id) => params.append('where[id][in]', String(id)));
    }

    const res = await fetch(`${PAYLOAD_API}/brands?${params.toString()}`);
    if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
    const data = await res.json();
    return data.docs;
  }

  async findOne(id: number) {
    const res = await fetch(`${PAYLOAD_API}/brands/${id}`);
    if (!res.ok) throw new NotFoundException(`Brand #${id} not found`);
    return res.json();
  }
}
