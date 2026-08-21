import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { buildPaginated, resolvePage } from '../common/pagination';
import { fetchStoreSettings, pixPrice, sellingPrice } from '../common/pricing';
import { Prisma, OrderStatus } from '@workspace/database';

const PAYLOAD_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api';

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
    // As regras comerciais vivem no admin do Payload; leitura fora da
    // transação para não segurar a conexão esperando rede.
    const settings = await fetchStoreSettings();

    // Modo orçamento: a loja desligou o pagamento pelo site, então o pedido
    // nasce sem `Payment` e o acerto acontece fora daqui. A flag do admin é
    // quem manda — método vindo de um front desatualizado é descartado, e
    // assim dado de cartão não chega ao banco por engano.
    if (settings.onlinePaymentEnabled && !dto.paymentMethod) {
      throw new BadRequestException(
        'paymentMethod é obrigatório enquanto o pagamento pelo site estiver ativo',
      );
    }
    const paymentMethod = settings.onlinePaymentEnabled
      ? dto.paymentMethod
      : undefined;

    const order = await this.prisma.$client.$transaction(async (tx) => {
      let subtotal = 0;
      // Total à vista: só os produtos marcados entram no desconto do PIX.
      let pixTotal = 0;
      let totalProducts = 0;
      const items: {
        productId: number;
        quantity: number;
        unitPrice: number;
      }[] = [];

      // Validate products via Payload API (products migraram do Prisma p/ Payload)
      for (const item of dto.items) {
        const res = await fetch(`${PAYLOAD_URL}/products/${item.productId}`);
        if (!res.ok) {
          throw new NotFoundException(`Product #${item.productId} not found`);
        }
        const product = (await res.json()) as {
          id: number;
          price: number;
          name: string;
          stock: number;
          discountPercent?: number | null;
          pixDiscount?: boolean | null;
        };

        if (product.stock < item.quantity) {
          throw new NotFoundException(
            `Product "${product.name}" has insufficient stock (${product.stock} available, ${item.quantity} requested)`,
          );
        }

        // O site mostra o preço já com desconto — a cobrança tem que bater.
        const unitPrice = sellingPrice(product.price, product.discountPercent);
        const unitPixPrice = product.pixDiscount
          ? pixPrice(unitPrice, settings.pixDiscountPercent)
          : unitPrice;

        subtotal += unitPrice * item.quantity;
        pixTotal += unitPixPrice * item.quantity;
        totalProducts += item.quantity;

        items.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
        });
      }

      const charged = paymentMethod === 'PIX' ? pixTotal : subtotal;

      const order = await tx.order.create({
        data: {
          customerId,
          // Cópia, não referência: o pedido não muda se o cliente mexer na
          // agenda de endereços dele depois.
          address: dto.address
            ? ({ ...dto.address } as Prisma.InputJsonObject)
            : Prisma.DbNull,
          retiraBalcao: dto.retiraBalcao ?? false,
          cepValue: dto.cepValue ?? 0,
          status: 'PENDING',
          totalProducts,
          subtotal,
          items: { create: items },
          // Orçamento não tem pagamento a registrar: a lista fica vazia e
          // `subtotal`/`cepValue` seguram os valores do pedido.
          payments: paymentMethod
            ? {
                create: {
                  method: paymentMethod,
                  status: 'PENDING',
                  // `subtotal` é o valor dos produtos; o pagamento é o que
                  // realmente será cobrado — no PIX, já com o desconto à
                  // vista.
                  amount: charged,
                  details: dto.paymentDetails ?? null,
                },
              }
            : undefined,
        },
        include: { items: true, payments: true },
      });

      return order;
    });

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
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, customerId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId },
      include: { items: true, payments: true },
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async findAllAdmin(query: QueryOrderDto = {}) {
    const where: Prisma.OrderWhereInput = {};

    if (query.search) {
      const term = query.search.trim();
      const or: Prisma.OrderWhereInput[] = [
        { customer: { email: { contains: term, mode: 'insensitive' } } },
        { customer: { firstName: { contains: term, mode: 'insensitive' } } },
        { customer: { lastName: { contains: term, mode: 'insensitive' } } },
      ];

      // Busca por número do pedido, aceitando com ou sem "#"
      const orderId = Number(term.replace(/^#/, ''));
      if (Number.isInteger(orderId) && orderId > 0) {
        or.unshift({ id: { equals: orderId } });
      }

      where.OR = or;
    }

    if (query.status) {
      where.status = query.status as Prisma.EnumOrderStatusFilter['equals'];
    }

    // Tipo de entrega: retirada no balcão ou envio
    if (query.delivery === 'pickup') where.retiraBalcao = true;
    if (query.delivery === 'shipping') where.retiraBalcao = false;

    let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'subtotal') {
      orderBy = { subtotal: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    if (query.sortBy === 'createdAt') {
      orderBy = { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const { take, skip, page } = resolvePage(query);

    const [docs, totalDocs] = await this.prisma.$client.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          customer: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          items: true,
          payments: true,
        },
        orderBy,
        take,
        skip,
      }),
      this.prisma.order.count({ where }),
    ]);

    return buildPaginated(docs, totalDocs, page, take);
  }

  /**
   * Totais do dashboard somados no banco.
   * Evita trazer todos os pedidos só para agregar no cliente.
   *
   * A série é mensal: o histórico é esparso (pedidos de 2021 em diante, poucos
   * por mês), então uma janela diária de 30 dias apareceria vazia.
   */
  async getSummary(months = 12) {
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const [totals, totalCustomers, series] = await Promise.all([
      this.prisma.order.aggregate({
        _count: { _all: true },
        _sum: { subtotal: true },
        _avg: { subtotal: true },
      }),
      this.prisma.customer.count(),
      this.prisma.$client.$queryRaw<
        Array<{ period: Date; revenue: bigint; orders: bigint }>
      >`
        SELECT date_trunc('month', "createdAt") AS period,
               COALESCE(SUM("subtotal"), 0) AS revenue,
               COUNT(*) AS orders
        FROM "Order"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY 1
      `,
    ]);

    return {
      totalOrders: totals._count._all,
      totalRevenue: totals._sum.subtotal ?? 0,
      avgTicket: Math.round(totals._avg.subtotal ?? 0),
      totalCustomers,
      series: series.map((row) => ({
        // AAAA-MM: o front preenche os meses sem pedidos
        period: row.period.toISOString().slice(0, 7),
        revenue: Number(row.revenue),
        orders: Number(row.orders),
      })),
    };
  }

  /**
   * O admin move o pedido pelo fluxo — confirmar, enviar, concluir. É a
   * única escrita em pedido depois da criação, e o cliente não alcança:
   * a rota fica atrás do `InternalKeyGuard`.
   */
  async updateStatus(orderId: number, status: OrderStatus) {
    const exists = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Order #${orderId} not found`);

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      select: { id: true, status: true },
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
        items: true,
        payments: true,
      },
    });
    if (!order) throw new NotFoundException(`Order #${orderId} not found`);
    return order;
  }
}
