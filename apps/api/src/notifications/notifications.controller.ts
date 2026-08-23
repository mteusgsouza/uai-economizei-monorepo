import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { DeleteSubscriptionDto } from './dto/delete-subscription.dto';
import { InternalKeyGuard } from '../auth/internal-key.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Public by design - the VAPID public key is not a secret
  @Get('public-key')
  getPublicKey() {
    return this.notificationsService.getPublicKey();
  }

  /**
   * O sino de novos pedidos vive nas views do admin do Payload, que autentica
   * por cookie próprio e não emite token do Firebase — por isso a inscrição
   * passa pela chave interna, chamada de uma server action.
   *
   * Antes estas rotas exigiam token de cliente e eram alcançáveis pelo `/bff`.
   * Não funcionavam (o front nem mandava o header) e, se funcionassem, dariam a
   * qualquer cliente logado o alerta de todo pedido da loja.
   */
  @UseGuards(InternalKeyGuard)
  @Post('admin/subscriptions')
  subscribeAdmin(@Body() dto: CreateSubscriptionDto) {
    return this.notificationsService.upsertAdminSubscription(dto);
  }

  @UseGuards(InternalKeyGuard)
  @Delete('admin/subscriptions')
  unsubscribeAdmin(@Body() dto: DeleteSubscriptionDto) {
    return this.notificationsService.removeAdminSubscription(dto.endpoint);
  }
}
