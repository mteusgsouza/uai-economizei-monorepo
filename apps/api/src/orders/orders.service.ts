import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Prisma } from '@workspace/database';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async getCustomerIdByFirebaseUid(
    firebaseUid: string,
  ): Promise<string> {
    const customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer.id;
  }

  async createByFirebaseUid(firebaseUid: string, dto: CreateOrderDto) {
    const customerId = await this.getCustomerIdByFirebaseUid(firebaseUid);
    return this.create(customerId, dto);
  }

  async findByFirebaseUid(firebaseUid: string) {
    const customerId = await this.getCustomerIdByFirebaseUid(firebaseUid);
    return this.findByCustomer(customerId);
  }

  async findOneByFirebaseUid(orderId: number, firebaseUid: string) {
    const customerId = await this.getCustomerIdByFirebaseUid(firebaseUid);
    return this.findOne(orderId, customerId);
  }

  async create(customerId: string, dto: CreateOrderDto) {
    const order = await this.prisma.$client.$transaction(async (tx) => {
      let subtotal = 0;
      let totalProducts = 0;
      const items: {
        productId: number;
        quantity: number;
        unitPrice: number;
      }[] = [];

      // Validate products and calculate totals
      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, value: true, name: true, stock: true },
        });

        if (!product) {
          throw new NotFoundException(`Product #${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new NotFoundException(
            `Product "${product.name}" has insufficient stock (${product.stock} available, ${item.quantity} requested)`,
          );
        }

        const unitPrice = product.value;
        subtotal += unitPrice * item.quantity;
        totalProducts += item.quantity;

        items.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
        });
      }

      // Create order with items and payment
      const order = await tx.order.create({
        data: {
          customerId,
          addressId: dto.addressId ?? null,
          status: 'PENDING',
          totalProducts,
          subtotal,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          payments: {
            create: {
              method: dto.paymentMethod,
              status: 'PENDING',
              amount: subtotal,
              details: dto.paymentDetails ?? null,
            },
          },
        },
        include: {
          items: { include: { product: true } },
          payments: true,
        },
      });

      return order;
    });

    // Fire-and-forget: push failures must never fail or delay the order
    this.notifyNewOrder(order.id, order.subtotal, customerId).catch((err) =>
      this.logger.error(`New order push failed: ${err}`),
    );

    return order;
  }

  private async notifyNewOrder(
    orderId: number,
    subtotalCents: number,
    customerId: string,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { firstName: true, lastName: true, email: true },
    });
    const name =
      [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') ||
      customer?.email ||
      'Cliente';
    const total = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(subtotalCents / 100);

    await this.notificationsService.sendToAll({
      title: `Novo pedido #${orderId}`,
      body: `${name} — ${total}`,
      tag: `order-${orderId}`,
      data: { url: '/dashboard/orders', orderId },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productMainImg: true,
                value: true,
              },
            },
          },
        },
        payments: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, customerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productMainImg: true,
                value: true,
              },
            },
          },
        },
        payments: true,
        address: true,
      },
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);

    return order;
  }

  async findAllAdmin(query: QueryOrderDto = {}) {
    const where: Prisma.OrderWhereInput = {};

    // Search by customer email/name OR product name
    if (query.search) {
      where.OR = [
        {
          customer: {
            email: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            firstName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          customer: {
            lastName: { contains: query.search, mode: 'insensitive' },
          },
        },
        {
          items: {
            some: {
              product: {
                name: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    // Status filter
    if (query.status) {
      where.status = query.status as any;
    }

    // Sorting
    let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'subtotal') {
      orderBy = { subtotal: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    if (query.sortBy === 'createdAt') {
      orderBy = { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    return this.prisma.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productMainImg: true,
                value: true,
              },
            },
          },
        },
        payments: true,
        address: true,
      },
      orderBy,
    });
  }

  async findOneAdmin(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productMainImg: true,
                value: true,
              },
            },
          },
        },
        payments: true,
        address: true,
      },
    });

    if (!order) throw new NotFoundException(`Order #${orderId} not found`);

    return order;
  }
}
