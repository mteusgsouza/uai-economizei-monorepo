import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryCepDto } from './dto/query-cep.dto';

const PAYLOAD_API = process.env.PAYLOAD_API_URL ?? 'http://localhost:3000/api';

export interface CepShipping {
  id: number;
  cepInicial: number;
  cepFinal: number;
  descricao: string;
  valor: number;
  createdAt: string;
  updatedAt: string;
}

interface PayloadList<T> {
  docs: T[];
}

@Injectable()
export class CepService {
  async findAll(query: QueryCepDto = {}): Promise<CepShipping[]> {
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

    const data = (await res.json()) as PayloadList<CepShipping>;
    return data.docs;
  }

  async findOne(id: number): Promise<CepShipping> {
    const res = await fetch(`${PAYLOAD_API}/cep-shipping/${id}`);

    if (!res.ok) {
      throw new NotFoundException(`CEP #${id} not found`);
    }

    return (await res.json()) as CepShipping;
  }
}
