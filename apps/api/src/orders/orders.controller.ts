import { Controller, Get, Post, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Public } from '../auth/public.decorator';
import { CustomerJwtAuthGuard } from '../customer-auth/customer-jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  @UseGuards(CustomerJwtAuthGuard)
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const customer = (req as any).user;
    return this.ordersService.create(customer.id, dto);
  }

  @Public()
  @Get()
  @UseGuards(CustomerJwtAuthGuard)
  findByCustomer(@Req() req: Request) {
    const customer = (req as any).user;
    return this.ordersService.findByCustomer(customer.id);
  }

  @Public()
  @Get(':id')
  @UseGuards(CustomerJwtAuthGuard)
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const customer = (req as any).user;
    return this.ordersService.findOne(id, customer.id);
  }
}
