import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCustomerIdByFirebaseUid(firebaseUid: string): Promise<string> {
    const customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException("Customer not found");
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
      const items: { productId: number; quantity: number; unitPrice: number }[] = [];

      // Validate products and calculate totals
      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, value: true, name: true, stock: true },
        });

        if (!product) {
          throw new NotFoundException(
            `Product #${item.productId} not found`
          );
        }

        if (product.stock < item.quantity) {
          throw new NotFoundException(
            `Product "${product.name}" has insufficient stock (${product.stock} available, ${item.quantity} requested)`
          );
        }

        const unitPrice = product.value;
        subtotal += unitPrice * item.quantity;
        totalProducts += item.quantity;

        items.push({ productId: item.productId, quantity: item.quantity, unitPrice });
      }

      // Create order with items and payment
      const order = await tx.order.create({
        data: {
          customerId,
          addressId: dto.addressId ?? null,
          status: "PENDING",
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
              status: "PENDING",
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

    return order;
  }

  async findByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, productMainImg: true, value: true },
            },
          },
        },
        payments: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, customerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, productMainImg: true, value: true },
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
}
