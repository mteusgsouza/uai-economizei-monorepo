import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Favoritos do cliente. Guarda só o id do produto — o catálogo vive no Payload
 * e é o front que hidrata a lista, com o mesmo `useProductsByIds` que já usava.
 */
@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Os ids na ordem em que a pessoa salvou.
   *
   * `createdAt` crescente não é detalhe: a página de favoritos mostra a lista
   * na ordem de quem salvou, não na do catálogo.
   */
  async list(customerId: string): Promise<number[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: { customerId },
      orderBy: { createdAt: 'asc' },
      select: { productId: true },
    });
    return items.map((item) => item.productId);
  }

  /**
   * Idempotente: favoritar de novo o mesmo produto não duplica nem estoura no
   * unique, e mantém a posição original na lista.
   */
  async add(customerId: string, productId: number) {
    await this.prisma.wishlistItem.upsert({
      where: { customerId_productId: { customerId, productId } },
      create: { customerId, productId },
      update: {},
    });
    return { success: true };
  }

  /** `deleteMany` para não estourar P2025 quando o item já saiu da lista. */
  async remove(customerId: string, productId: number) {
    await this.prisma.wishlistItem.deleteMany({
      where: { customerId, productId },
    });
    return { success: true };
  }
}
