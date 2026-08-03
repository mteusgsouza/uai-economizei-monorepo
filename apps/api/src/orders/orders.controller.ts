import type { AuthenticatedRequest } from '../auth/authenticated-request';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { InternalKeyGuard } from '../auth/internal-key.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    const firebaseUid = req.firebaseUid!;
    return this.ordersService.createByFirebaseUid(firebaseUid, dto);
  }

  // Admin endpoint - list all orders (must be before :id)
  @UseGuards(InternalKeyGuard)
  @Get('all')
  findAllAdmin(@Query() query: QueryOrderDto) {
    return this.ordersService.findAllAdmin(query);
  }

  // Admin endpoint - totais agregados do dashboard (must be before :id)
  @UseGuards(InternalKeyGuard)
  @Get('summary')
  getSummary() {
    return this.ordersService.getSummary();
  }

  // Admin endpoint - get single order by ID
  @UseGuards(InternalKeyGuard)
  @Get('admin/:id')
  findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOneAdmin(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get()
  findByCustomer(@Req() req: AuthenticatedRequest) {
    const firebaseUid = req.firebaseUid!;
    return this.ordersService.findByFirebaseUid(firebaseUid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const firebaseUid = req.firebaseUid!;
    return this.ordersService.findOneByFirebaseUid(id, firebaseUid);
  }
}
