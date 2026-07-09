import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import type { Order } from '@workspace/database';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateOrderDto) {
    const orders = await this.prisma.$client.$transaction(async (tx) => {
      const createdOrders: Order[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, price: true, name: true },
        });

        if (!product) {
          throw new NotFoundException(`Product #${item.productId} not found`);
        }

        const totalPrice = product.price * item.quantity;

        const order = await tx.order.create({
          data: {
            customerId,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice,
            status: 'PENDING',
          },
        });

        createdOrders.push(order);
      }

      if (createdOrders.length > 0) {
        const totalAmount = createdOrders.reduce(
          (sum, o) => sum + o.totalPrice,
          0,
        );

        await tx.payment.create({
          data: {
            orderId: createdOrders[0].id,
            method: dto.paymentMethod,
            status: 'PENDING',
            amount: totalAmount,
          },
        });
      }

      return createdOrders;
    });

    return orders;
  }

  async findByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: { product: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, customerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId },
      include: { product: true, payment: true },
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);

    return order;
  }
}
