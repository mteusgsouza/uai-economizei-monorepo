import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryCategoryDto } from './dto/query-category.dto';

const PAYLOAD_API = 'http://localhost:3000/api';

@Injectable()
export class CategoriesService {
  async findAll(query: QueryCategoryDto = {}) {
    const params = new URLSearchParams();
    params.set('depth', '1');
    params.set('limit', '0');

    if (query.search) {
      params.set('where[title][like]', query.search);
    }

    let sortField = 'title';
    if (query.sortBy === 'title') {
      sortField = query.sortOrder === 'asc' ? 'title' : '-title';
    } else if (query.sortBy === 'createdAt') {
      sortField = query.sortOrder === 'asc' ? 'createdAt' : '-createdAt';
    }
    params.set('sort', sortField);

    const res = await fetch(`${PAYLOAD_API}/categories?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Payload API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.docs;
  }

  async findOne(id: number) {
    const res = await fetch(`${PAYLOAD_API}/categories/${id}?depth=1`);

    if (!res.ok) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    return res.json();
  }
}
