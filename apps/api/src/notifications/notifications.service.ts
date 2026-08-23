import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as webPush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private enabled = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      this.logger.warn('VAPID keys missing - web push disabled');
      return;
    }

    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
      publicKey,
      privateKey,
    );
    this.enabled = true;
  }

  getPublicKey() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new ServiceUnavailableException('Web push is not configured');
    }
    return { publicKey };
  }

  /**
   * Assinatura do admin, vinda do sino nas views do Payload.
   *
   * Não tem `firebaseUid` porque usuário do admin não é usuário do Firebase —
   * quem autoriza é a chave interna, conferida no controller. É o `scope` que
   * separa quem recebe alerta de pedido de quem só é cliente da loja.
   */
  upsertAdminSubscription(dto: CreateSubscriptionDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: {
        endpoint: dto.endpoint,
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        scope: 'ADMIN',
        userAgent: dto.userAgent ?? null,
      },
      update: {
        p256dh: dto.keys.p256dh,
        auth: dto.keys.auth,
        scope: 'ADMIN',
        userAgent: dto.userAgent ?? null,
      },
    });
  }

  async removeAdminSubscription(endpoint: string) {
    // deleteMany é idempotente: sem P2025 quando o endpoint já saiu. O filtro
    // por scope impede que a rota do admin apague assinatura de cliente.
    await this.prisma.pushSubscription.deleteMany({
      where: { endpoint, scope: 'ADMIN' },
    });
    return { success: true };
  }

  /**
   * Alerta operacional: vai só para quem administra a loja.
   *
   * Era um `sendToAll` sobre a tabela inteira — com o nome e o total do pedido
   * no corpo, qualquer assinatura de cliente que existisse passaria a receber
   * os pedidos dos outros.
   */
  async sendToAdmins(payload: PushPayload): Promise<void> {
    try {
      if (!this.enabled) return;

      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { scope: 'ADMIN' },
      });
      if (subscriptions.length === 0) return;

      const json = JSON.stringify(payload);
      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            json,
          ),
        ),
      );

      const expired: string[] = [];
      results.forEach((result, index) => {
        if (result.status !== 'rejected') return;
        const error = result.reason as webPush.WebPushError;
        // 404/410 = subscription expired or unsubscribed - clean it up
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          expired.push(subscriptions[index].endpoint);
        } else {
          this.logger.error(
            `Failed to send push (${error?.statusCode ?? '?'}): ${error?.message ?? error}`,
          );
        }
      });

      if (expired.length > 0) {
        await this.prisma.pushSubscription.deleteMany({
          where: { endpoint: { in: expired } },
        });
      }
    } catch (error) {
      this.logger.error(`sendToAdmins failed: ${error}`);
    }
  }
}
