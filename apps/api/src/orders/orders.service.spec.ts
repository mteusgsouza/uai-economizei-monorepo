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
