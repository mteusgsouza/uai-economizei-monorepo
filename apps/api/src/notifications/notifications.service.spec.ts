import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService.removeSubscription', () => {
  let service: NotificationsService;
  let deleteMany: jest.Mock;

  beforeEach(() => {
    deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      pushSubscription: { deleteMany },
    } as unknown as PrismaService;

    service = new NotificationsService(prisma);
  });

  it('só apaga a subscription do próprio dono (endpoint + firebaseUid)', async () => {
    await service.removeSubscription('endpoint-abc', 'user-123');

    expect(deleteMany).toHaveBeenCalledWith({
      where: { endpoint: 'endpoint-abc', firebaseUid: 'user-123' },
    });
  });

  it('não permite apagar por endpoint sozinho, sem o uid do dono', async () => {
    await service.removeSubscription('endpoint-abc', 'user-123');

    const [{ where }] = deleteMany.mock.calls[0] as [
      { where: Record<string, unknown> },
    ];
    expect(where).toHaveProperty('firebaseUid');
  });
});
