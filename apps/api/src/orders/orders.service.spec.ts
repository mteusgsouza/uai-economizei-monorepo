import { ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService.create — ownership do endereço', () => {
  let service: OrdersService;
  let findFirstAddress: jest.Mock;
  let transaction: jest.Mock;

  const dto: CreateOrderDto = {
    items: [{ productId: 1, quantity: 1 }],
    addressId: 42,
    paymentMethod: 'PIX' as CreateOrderDto['paymentMethod'],
  };

  beforeEach(() => {
    findFirstAddress = jest.fn();
    transaction = jest.fn();

    const prisma = {
      address: { findFirst: findFirstAddress },
      $client: { $transaction: transaction },
    } as unknown as PrismaService;

    const notifications = {} as unknown as NotificationsService;

    service = new OrdersService(prisma, notifications);
  });

  it('rejeita quando o addressId não pertence ao cliente', async () => {
    findFirstAddress.mockResolvedValue(null);

    await expect(service.create('customer-1', dto)).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(findFirstAddress).toHaveBeenCalledWith({
      where: { id: 42, customerId: 'customer-1' },
      select: { id: true },
    });
    expect(transaction).not.toHaveBeenCalled();
  });

  it('segue para a transação quando o endereço pertence ao cliente', async () => {
    findFirstAddress.mockResolvedValue({ id: 42 });
    transaction.mockRejectedValue(new Error('stop-after-ownership-check'));

    await expect(service.create('customer-1', dto)).rejects.toThrow(
      'stop-after-ownership-check',
    );
    expect(transaction).toHaveBeenCalled();
  });

  it('não verifica endereço quando addressId não é informado', async () => {
    transaction.mockRejectedValue(new Error('stop-after-ownership-check'));

    await expect(
      service.create('customer-1', { ...dto, addressId: undefined }),
    ).rejects.toThrow('stop-after-ownership-check');
    expect(findFirstAddress).not.toHaveBeenCalled();
  });
});

/**
 * O preço que a vitrine anuncia sai de `mapProduct` no front; o que a loja
 * cobra sai daqui. Estes testes prendem os dois ao mesmo número.
 */
interface OrderCreateData {
  subtotal: number;
  items: { create: { unitPrice: number }[] };
  payments: { create: { amount: number } };
}

describe('OrdersService.create — preço cobrado', () => {
  let service: OrdersService;
  let createOrder: jest.Mock;

  /** O `data` que o serviço mandou para o Prisma. */
  function orderData(): OrderCreateData {
    return (createOrder.mock.calls[0] as [{ data: OrderCreateData }])[0].data;
  }

  /** Roda o corpo real da transação contra um `tx` de mentira. */
  function buildService(product: Record<string, unknown>, pixPercent: number) {
    createOrder = jest
      .fn()
      .mockResolvedValue({ id: 1, subtotal: 0, items: [] });

    const prisma = {
      address: { findFirst: jest.fn() },
      customer: { findUnique: jest.fn().mockResolvedValue(null) },
      $client: {
        $transaction: (fn: (tx: unknown) => Promise<unknown>) =>
          fn({ order: { create: createOrder } }),
      },
    } as unknown as PrismaService;

    global.fetch = jest.fn((url: string) =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            String(url).includes('store-settings')
              ? { pixDiscountPercent: pixPercent }
              : product,
          ),
      }),
    ) as unknown as typeof fetch;

    service = new OrdersService(prisma, {
      sendToAll: jest.fn(),
    } as unknown as NotificationsService);
  }

  const base = { id: 1, name: 'Produto', price: 89900, stock: 10 };

  it('grava o item com o desconto do produto já abatido', async () => {
    buildService({ ...base, discountPercent: 39, pixDiscount: false }, 10);

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 2 }],
      paymentMethod: 'CREDIT_CARD' as CreateOrderDto['paymentMethod'],
    });

    const data = orderData();
    expect(data.items.create[0]?.unitPrice).toBe(54839);
    expect(data.subtotal).toBe(109678);
    expect(data.payments.create.amount).toBe(109678);
  });

  it('cobra o preço à vista quando o pagamento é PIX', async () => {
    buildService(
      { ...base, price: 54900, discountPercent: 0, pixDiscount: true },
      10,
    );

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'PIX' as CreateOrderDto['paymentMethod'],
    });

    const data = orderData();
    // O subtotal segue sendo o valor dos produtos; o desconto vive no pagamento.
    expect(data.subtotal).toBe(54900);
    expect(data.payments.create.amount).toBe(49410);
  });

  it('não dá desconto de PIX a produto que não está marcado', async () => {
    buildService(
      { ...base, price: 54900, discountPercent: 0, pixDiscount: false },
      10,
    );

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'PIX' as CreateOrderDto['paymentMethod'],
    });

    expect(orderData().payments.create.amount).toBe(54900);
  });
});
