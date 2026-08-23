import { WishlistService } from './wishlist.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WishlistService', () => {
  let service: WishlistService;
  let findMany: jest.Mock;
  let upsert: jest.Mock;
  let deleteMany: jest.Mock;

  beforeEach(() => {
    findMany = jest.fn().mockResolvedValue([]);
    upsert = jest.fn().mockResolvedValue({});
    deleteMany = jest.fn().mockResolvedValue({ count: 1 });

    const prisma = {
      wishlistItem: { findMany, upsert, deleteMany },
    } as unknown as PrismaService;

    service = new WishlistService(prisma);
  });

  it('devolve os ids na ordem em que foram salvos', async () => {
    findMany.mockResolvedValue([
      { productId: 42 },
      { productId: 7 },
      { productId: 13 },
    ]);

    await expect(service.list('customer-1')).resolves.toEqual([42, 7, 13]);
    expect(findMany).toHaveBeenCalledWith({
      where: { customerId: 'customer-1' },
      orderBy: { createdAt: 'asc' },
      select: { productId: true },
    });
  });

  it('favoritar duas vezes não duplica nem muda a posição', async () => {
    await service.add('customer-1', 42);

    // `update: {}` é o que preserva o `createdAt` original — e com ele a ordem.
    expect(upsert).toHaveBeenCalledWith({
      where: {
        customerId_productId: { customerId: 'customer-1', productId: 42 },
      },
      create: { customerId: 'customer-1', productId: 42 },
      update: {},
    });
  });

  it('só remove da lista do próprio cliente', async () => {
    await service.remove('customer-1', 42);

    expect(deleteMany).toHaveBeenCalledWith({
      where: { customerId: 'customer-1', productId: 42 },
    });
  });

  it('remover algo que não está na lista não estoura', async () => {
    deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.remove('customer-1', 999)).resolves.toEqual({
      success: true,
    });
  });
});
