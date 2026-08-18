import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { buildPaginated, resolvePage } from '../common/pagination';
import { Prisma } from '@workspace/database';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { addresses: true },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const { deletedAt: _deletedAt, ...profile } = customer;
    return profile;
  }

  async getProfileByFirebaseUid(firebaseUid: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
      include: { addresses: true },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const { deletedAt: _deletedAt, ...profile } = customer;
    return profile;
  }

  async updateProfile(customerId: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.username !== undefined && { username: dto.username }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.picture !== undefined && { picture: dto.picture }),
        ...(dto.theme !== undefined && {
          theme: dto.theme as Prisma.InputJsonValue,
        }),
      },
    });
  }

  /** Só o id — as rotas de endereço não precisam do perfil inteiro. */
  async getIdByFirebaseUid(firebaseUid: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer.id;
  }

  async updateProfileByFirebaseUid(
    firebaseUid: string,
    dto: UpdateCustomerDto,
  ) {
    const customerId = await this.getIdByFirebaseUid(firebaseUid);
    return this.updateProfile(customerId, dto);
  }

  async findAll(query: QueryCustomerDto = {}) {
    const where: Prisma.CustomerWhereInput = {};
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.verified === 'true') where.verifiedUser = true;
    if (query.verified === 'false') where.verifiedUser = false;

    let orderBy: Prisma.CustomerOrderByWithRelationInput = {
      createdAt: 'desc',
    };
    if (query.sortBy === 'firstName') {
      orderBy = { firstName: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    if (query.sortBy === 'createdAt') {
      orderBy = { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const { take, skip, page } = resolvePage(query);

    const [docs, totalDocs] = await this.prisma.$client.$transaction([
      this.prisma.customer.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true,
          verifiedUser: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { orders: true, addresses: true } },
        },
        orderBy,
        take,
        skip,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return buildPaginated(docs, totalDocs, page, take);
  }

  async findOneAdmin(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          include: {
            items: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const { deletedAt: _deletedAt, ...profile } = customer;
    return profile;
  }
}
