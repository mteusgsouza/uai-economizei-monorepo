import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AddressesService } from './addresses.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, AddressesService],
  // WishlistModule resolve o customerId pelo uid do Firebase daqui.
  exports: [CustomersService],
})
export class CustomersModule {}
