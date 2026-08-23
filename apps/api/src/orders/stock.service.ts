import { Injectable, Logger } from '@nestjs/common';
import type { OrderItem } from '@workspace/database';
import { patchProduct } from '../products/sync/payload-catalog';

const PAYLOAD_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api';

/**
 * O que a baixa de estoque precisa saber de cada linha do pedido. Derivado do
 * model do Prisma para não desencontrar do schema.
 */
export type StockMovement = Pick<OrderItem, 'productId' | 'quantity'>;

/**
 * Estoque do catálogo, que vive no Payload — este banco só guarda o pedido.
 *
 * ATENÇÃO: o REST do Payload não tem incremento atômico, então cada movimento é
 * ler-e-escrever. Duas confirmações simultâneas do mesmo produto podem se
 * atropelar e deixar o estoque alto por uma unidade. Para o volume desta loja
 * isso é aceitável; se um dia deixar de ser, a saída é mover a operação para um
 * endpoint próprio no Payload, com a conta feita lá dentro.
 */
@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  /** Tira as peças do catálogo. Chamado quando o admin confirma o pedido. */
  async decrease(movements: StockMovement[]): Promise<void> {
    await this.apply(movements, -1);
  }

  /** Devolve as peças. Chamado no cancelamento de um pedido já confirmado. */
  async increase(movements: StockMovement[]): Promise<void> {
    await this.apply(movements, 1);
  }

  /**
   * Sequencial de propósito: em paralelo, dois itens do mesmo produto no mesmo
   * pedido leriam o mesmo estoque e a segunda escrita apagaria a primeira.
   *
   * Não engole falha. Quem chama grava o status **depois** desta promessa
   * resolver — assim um 403 do Payload deixa o pedido parado onde estava, em
   * vez de confirmado com o estoque intacto.
   */
  private async apply(movements: StockMovement[], sign: 1 | -1): Promise<void> {
    for (const movement of movements) {
      const current = await this.readStock(movement.productId);

      // Estoque não vai a negativo: o catálogo trata `stock <= 0` como esgotado
      // e um número negativo só sujaria a vitrine e o admin.
      const next = Math.max(0, current + sign * movement.quantity);
      if (next === current) continue;

      await patchProduct(movement.productId, { stock: next });
      this.logger.log(
        `Product #${movement.productId}: stock ${current} -> ${next}`,
      );
    }
  }

  private async readStock(productId: number): Promise<number> {
    const res = await fetch(`${PAYLOAD_URL}/products/${productId}?depth=0`);
    if (!res.ok) {
      throw new Error(
        `Falha ao ler o estoque do produto #${productId}: ${res.status}`,
      );
    }

    const product = (await res.json()) as { stock?: number | null };
    return product.stock ?? 0;
  }
}
