import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import type { Request } from "express";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const firebaseUid = (req as any).firebaseUid;
    return this.ordersService.createByFirebaseUid(firebaseUid, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get()
  findByCustomer(@Req() req: Request) {
    const firebaseUid = (req as any).firebaseUid;
    return this.ordersService.findByFirebaseUid(firebaseUid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(":id")
  findOne(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const firebaseUid = (req as any).firebaseUid;
    return this.ordersService.findOneByFirebaseUid(id, firebaseUid);
  }
}
