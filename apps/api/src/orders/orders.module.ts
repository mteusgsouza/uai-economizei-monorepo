import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { StockService } from './stock.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CepModule } from '../cep/cep.module';

@Module({
  imports: [NotificationsModule, CepModule],
  controllers: [OrdersController],
  providers: [OrdersService, StockService],
})
export class OrdersModule {}
