import { Controller, Get, Post, Patch, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CustomersService } from './customers.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Public } from '../auth/public.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/customer-jwt-auth.guard';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Public()
  @Get('me')
  @UseGuards(CustomerJwtAuthGuard)
  getProfile(@Req() req: Request) {
    const customer = (req as any).user;
    return this.customersService.getProfile(customer.id);
  }

  @Public()
  @Patch('me')
  @UseGuards(CustomerJwtAuthGuard)
  updateProfile(@Req() req: Request, @Body() dto: UpdateCustomerDto) {
    const customer = (req as any).user;
    return this.customersService.updateProfile(customer.id, dto);
  }

  @Public()
  @Get('me/addresses')
  @UseGuards(CustomerJwtAuthGuard)
  getAddresses(@Req() req: Request) {
    const customer = (req as any).user;
    return this.customersService.getAddresses(customer.id);
  }

  @Public()
  @Post('me/addresses')
  @UseGuards(CustomerJwtAuthGuard)
  createAddress(@Req() req: Request, @Body() dto: CreateAddressDto) {
    const customer = (req as any).user;
    return this.customersService.createAddress(customer.id, dto);
  }
}
