import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AddressesService } from './addresses.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, AddressesService],
})
export class CustomersModule {}
