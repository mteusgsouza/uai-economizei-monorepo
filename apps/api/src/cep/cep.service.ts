import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryCepDto } from './dto/query-cep.dto';

const PAYLOAD_API = process.env.PAYLOAD_API_URL ?? 'http://localhost:3000/api';

@Injectable()
export class CepService {
  async findAll(query: QueryCepDto = {}) {
    const params = new URLSearchParams();
    params.set('limit', '0');

    if (query.search) {
      params.set('where[descricao][like]', query.search);
    }

    let sortField = 'cepInicial';
    if (query.sortBy === 'cepInicial') {
      sortField = query.sortOrder === 'asc' ? 'cepInicial' : '-cepInicial';
    } else if (query.sortBy === 'valor') {
      sortField = query.sortOrder === 'asc' ? 'valor' : '-valor';
    }
    params.set('sort', sortField);

    const res = await fetch(`${PAYLOAD_API}/cep-shipping?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Payload API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.docs;
  }

  async findOne(id: number) {
    const res = await fetch(`${PAYLOAD_API}/cep-shipping/${id}`);

    if (!res.ok) {
      throw new NotFoundException(`CEP #${id} not found`);
    }

    return res.json();
  }
}
