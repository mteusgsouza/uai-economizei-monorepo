import { IsEnum } from 'class-validator';
import { OrderStatus } from '@workspace/database';

/**
 * A única escrita em pedido depois da criação. O cliente nunca chega aqui: a
 * rota é do admin, atrás do `InternalKeyGuard`.
 */
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
