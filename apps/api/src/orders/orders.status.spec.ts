import { NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@workspace/database';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StockService } from './stock.service';
import { CepService } from '../cep/cep.service';

/**
 * O estoque se mexe aqui, e não na criação: no modo orçamento o pedido nasce
 * como proposta, então baixar em PENDING faria proposta abandonada esvaziar a
 * vitrine.
 */
describe('OrdersService.updateStatus — estoque', () => {
  let service: OrdersService;
  let decrease: jest.Mock;
  let increase: jest.Mock;
  let update: jest.Mock;

  const items = [{ productId: 42, quantity: 2 }];

  function buildService(current: {
    status: OrderStatus;
    stockApplied: boolean;
  }) {
    decrease = jest.fn().mockResolvedValue(undefined);
    increase = jest.fn().mockResolvedValue(undefined);
    update = jest.fn().mockResolvedValue({ id: 1, status: 'CONFIRMED' });

    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, ...current, items }),
        update,
      },
    } as unknown as PrismaService;

    service = new OrdersService(
      prisma,
      {} as unknown as NotificationsService,
      { decrease, increase } as unknown as StockService,
      {} as unknown as CepService,
    );
  }

  /** O `data` que o serviço mandou para o Prisma. */
  function updateData(): { status: OrderStatus; stockApplied: boolean } {
    return (
      update.mock.calls[0] as [
        { data: { status: OrderStatus; stockApplied: boolean } },
      ]
    )[0].data;
  }

  it('baixa o estoque quando o admin confirma', async () => {
    buildService({ status: 'PENDING', stockApplied: false });

    await service.updateStatus(1, 'CONFIRMED');

    expect(decrease).toHaveBeenCalledWith(items);
    expect(updateData().stockApplied).toBe(true);
  });

  it('não baixa de novo ao avançar de CONFIRMED para SHIPPED', async () => {
    buildService({ status: 'CONFIRMED', stockApplied: true });

    await service.updateStatus(1, 'SHIPPED');

    expect(decrease).not.toHaveBeenCalled();
    expect(increase).not.toHaveBeenCalled();
    expect(updateData().stockApplied).toBe(true);
  });

  it('devolve o estoque no cancelamento de um pedido confirmado', async () => {
    buildService({ status: 'SHIPPED', stockApplied: true });

    await service.updateStatus(1, 'CANCELLED');

    expect(increase).toHaveBeenCalledWith(items);
    expect(updateData().stockApplied).toBe(false);
  });

  it('cancelar um pedido que nunca baixou não devolve nada', async () => {
    buildService({ status: 'PENDING', stockApplied: false });

    await service.updateStatus(1, 'CANCELLED');

    expect(increase).not.toHaveBeenCalled();
    expect(updateData().stockApplied).toBe(false);
  });

  it('voltar para PENDING solta as peças de volta ao catálogo', async () => {
    buildService({ status: 'CONFIRMED', stockApplied: true });

    await service.updateStatus(1, 'PENDING');

    expect(increase).toHaveBeenCalledWith(items);
    expect(updateData().stockApplied).toBe(false);
  });

  it('encomenda não segura estoque', async () => {
    buildService({ status: 'PENDING', stockApplied: false });

    await service.updateStatus(1, 'PREORDER');

    expect(decrease).not.toHaveBeenCalled();
    expect(updateData().stockApplied).toBe(false);
  });

  it('falha no Payload deixa o status onde estava', async () => {
    buildService({ status: 'PENDING', stockApplied: false });
    decrease.mockRejectedValue(new Error('PATCH 403'));

    await expect(service.updateStatus(1, 'CONFIRMED')).rejects.toThrow(
      'PATCH 403',
    );

    // Confirmado com o estoque intacto seria pior do que uma confirmação que
    // o admin precisa repetir.
    expect(update).not.toHaveBeenCalled();
  });

  it('pedido inexistente continua 404', async () => {
    buildService({ status: 'PENDING', stockApplied: false });
    const prisma = {
      order: { findUnique: jest.fn().mockResolvedValue(null), update },
    } as unknown as PrismaService;
    service = new OrdersService(
      prisma,
      {} as unknown as NotificationsService,
      { decrease, increase } as unknown as StockService,
      {} as unknown as CepService,
    );

    await expect(service.updateStatus(999, 'CONFIRMED')).rejects.toThrow(
      NotFoundException,
    );
  });
});
