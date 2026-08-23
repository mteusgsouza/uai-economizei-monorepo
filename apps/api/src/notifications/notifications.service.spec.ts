import * as webPush from 'web-push';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService — assinaturas do admin', () => {
  let service: NotificationsService;
  let deleteMany: jest.Mock;

  beforeEach(() => {
    deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      pushSubscription: { deleteMany },
    } as unknown as PrismaService;

    service = new NotificationsService(prisma);
  });

  it('só apaga assinatura de admin, nunca a de um cliente', async () => {
    await service.removeAdminSubscription('endpoint-abc');

    expect(deleteMany).toHaveBeenCalledWith({
      where: { endpoint: 'endpoint-abc', scope: 'ADMIN' },
    });
  });

  it('não apaga por endpoint sozinho, sem o escopo', async () => {
    await service.removeAdminSubscription('endpoint-abc');

    const [{ where }] = deleteMany.mock.calls[0] as [
      { where: Record<string, unknown> },
    ];
    expect(where).toHaveProperty('scope', 'ADMIN');
  });
});

describe('NotificationsService.sendToAdmins', () => {
  it('busca só as assinaturas do admin — pedido não vaza para cliente', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      pushSubscription: { findMany },
    } as unknown as PrismaService;

    const service = new NotificationsService(prisma);
    // Sem VAPID o envio nem chega à consulta; as chaves aqui são descartáveis.
    const keys = webPush.generateVAPIDKeys();
    process.env.VAPID_PUBLIC_KEY = keys.publicKey;
    process.env.VAPID_PRIVATE_KEY = keys.privateKey;
    process.env.VAPID_SUBJECT = 'mailto:test@example.com';
    service.onModuleInit();

    await service.sendToAdmins({ title: 'Novo pedido #1', body: 'Cliente' });

    expect(findMany).toHaveBeenCalledWith({ where: { scope: 'ADMIN' } });
  });
});
