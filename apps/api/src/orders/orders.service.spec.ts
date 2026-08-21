import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@workspace/database';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';

/**
 * O preço que a vitrine anuncia sai de `mapProduct` no front; o que a loja
 * cobra sai daqui. Estes testes prendem os dois ao mesmo número.
 */
interface OrderCreateData {
  subtotal: number;
  address: unknown;
  retiraBalcao: boolean;
  cepValue: number;
  items: { create: { unitPrice: number }[] };
  /** Ausente no orçamento — a loja desligou o pagamento pelo site. */
  payments?: { create: { amount: number; method: string } };
}

describe('OrdersService.create — preço cobrado', () => {
  let service: OrdersService;
  let createOrder: jest.Mock;

  /** O `data` que o serviço mandou para o Prisma. */
  function orderData(): OrderCreateData {
    return (createOrder.mock.calls[0] as [{ data: OrderCreateData }])[0].data;
  }

  /** Roda o corpo real da transação contra um `tx` de mentira. */
  function buildService(
    product: Record<string, unknown>,
    pixPercent: number,
    onlinePaymentEnabled = true,
  ) {
    createOrder = jest
      .fn()
      .mockResolvedValue({ id: 1, subtotal: 0, items: [] });

    const prisma = {
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
              ? {
                  pixDiscountPercent: pixPercent,
                  onlinePayment: { enabled: onlinePaymentEnabled },
                }
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
    expect(data.payments?.create.amount).toBe(109678);
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
    expect(data.payments?.create.amount).toBe(49410);
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

    expect(orderData().payments?.create.amount).toBe(54900);
  });

  it('guarda uma cópia do endereço no pedido, não uma referência', async () => {
    buildService({ ...base, discountPercent: 0, pixDiscount: false }, 10);
    const address = {
      street: 'Rua Osório Duque Estrada',
      number: '15',
      neighborhood: 'Campo Alegre',
      city: 'Belo Horizonte',
      state: 'MG',
      postalCode: '31730-000',
    };

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'PIX' as CreateOrderDto['paymentMethod'],
      address,
    });

    // O pedido carrega o endereço da entrega; mexer na agenda do cliente
    // depois não reescreve o histórico.
    expect(orderData().address).toEqual(address);
    expect(orderData().retiraBalcao).toBe(false);
  });

  it('retirada no balcão não guarda endereço de entrega', async () => {
    buildService({ ...base, discountPercent: 0, pixDiscount: false }, 10);

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'PIX' as CreateOrderDto['paymentMethod'],
      retiraBalcao: true,
    });

    // `address` nulo + flag ligada é o que o filtro do dashboard consulta.
    expect(orderData().retiraBalcao).toBe(true);
    expect(orderData().address).toEqual(Prisma.DbNull);
    expect(orderData().cepValue).toBe(0);
  });

  it('registra o frete sem mexer no valor cobrado', async () => {
    buildService(
      { ...base, price: 54900, discountPercent: 0, pixDiscount: false },
      10,
    );

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'CREDIT_CARD' as CreateOrderDto['paymentMethod'],
      cepValue: 1500,
    });

    expect(orderData().cepValue).toBe(1500);
    // O frete é registro do pedido; a cobrança segue sendo só os produtos.
    expect(orderData().payments?.create.amount).toBe(54900);
  });

  it('não registra pagamento quando a loja desligou o pagamento pelo site', async () => {
    buildService(
      { ...base, price: 54900, discountPercent: 0, pixDiscount: true },
      10,
      false,
    );

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 1 }],
    });

    // O pedido é um orçamento: sem `Payment`, mas com os valores gravados.
    expect(orderData().payments).toBeUndefined();
    expect(orderData().subtotal).toBe(54900);
  });

  it('ignora a forma de pagamento que um front desatualizado mandar', async () => {
    buildService(
      { ...base, price: 54900, discountPercent: 0, pixDiscount: true },
      10,
      false,
    );

    await service.create('customer-1', {
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'CREDIT_CARD' as CreateOrderDto['paymentMethod'],
      paymentDetails: '{"cardNumber":"4111111111111111"}',
    });

    // A flag do admin manda: dado de cartão não chega ao banco por engano.
    expect(orderData().payments).toBeUndefined();
  });

  it('exige a forma de pagamento enquanto a loja cobra pelo site', async () => {
    buildService({ ...base, discountPercent: 0, pixDiscount: false }, 10);

    await expect(
      service.create('customer-1', { items: [{ productId: 1, quantity: 1 }] }),
    ).rejects.toThrow(BadRequestException);
  });
});
