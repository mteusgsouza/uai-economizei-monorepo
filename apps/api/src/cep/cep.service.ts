import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryCepDto } from './dto/query-cep.dto';
import {
  resolvePage,
  buildPaginated,
  type Paginated,
} from '../common/pagination';

const PAYLOAD_API = process.env.PAYLOAD_API_URL ?? 'http://localhost:3000/api';

// Mais restritivo que o default de `resolvePage` (200): é a tabela de fretes
// completa, só o admin do Payload consome, não precisa de páginas maiores.
const MAX_LIMIT = 100;

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

/** `found: false` quando o CEP está fora da área de entrega. */
export type CepLookupResult =
  | { found: true; valor: number; descricao: string }
  | { found: false };

@Injectable()
export class CepService {
  async findAll(query: QueryCepDto = {}): Promise<Paginated<CepShipping>> {
    const { take, page } = resolvePage(query);
    const limit = Math.min(take, MAX_LIMIT);

    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('page', String(page));

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

    const data = (await res.json()) as PayloadList<CepShipping> & {
      totalDocs: number;
    };
    return buildPaginated(data.docs, data.totalDocs, page, limit);
  }

  /**
   * Frete da faixa que contém o CEP.
   *
   * A tabela tem faixas sobrepostas (o mesmo CEP chega a casar com 4 faixas
   * iguais), então ordena por valor e pega a primeira: o resultado fica
   * determinístico e favorável ao cliente.
   */
  async lookup(cep: string): Promise<CepLookupResult> {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return { found: false };

    const target = Number(digits);
    const params = new URLSearchParams({
      'where[cepInicial][less_than_equal]': String(target),
      'where[cepFinal][greater_than_equal]': String(target),
      sort: 'valor',
      limit: '1',
      depth: '0',
    });

    const res = await fetch(`${PAYLOAD_API}/cep-shipping?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Payload API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as PayloadList<CepShipping>;
    const faixa = data.docs[0];
    if (!faixa) return { found: false };

    return { found: true, valor: faixa.valor, descricao: faixa.descricao };
  }

  async findOne(id: number): Promise<CepShipping> {
    const res = await fetch(`${PAYLOAD_API}/cep-shipping/${id}`);

    if (!res.ok) {
      throw new NotFoundException(`CEP #${id} not found`);
    }

    return (await res.json()) as CepShipping;
  }
}
