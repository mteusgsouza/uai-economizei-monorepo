import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { QueryCustomerDto } from "./dto/query-customer.dto";
import { Prisma } from "@workspace/database";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { addresses: true },
    });

    if (!customer) throw new NotFoundException("Customer not found");

    const { deletedAt, ...profile } = customer;
    return profile;
  }

  async getProfileByFirebaseUid(firebaseUid: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
      include: { addresses: true },
    });

    if (!customer) throw new NotFoundException("Customer not found");

    const { deletedAt, ...profile } = customer;
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
        ...(dto.theme !== undefined && { theme: dto.theme as any }),
      },
    });
  }

  async updateProfileByFirebaseUid(
    firebaseUid: string,
    dto: UpdateCustomerDto
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { firebaseUid },
    });

    if (!customer) throw new NotFoundException("Customer not found");

    return this.updateProfile(customer.id, dto);
  }

  async getAddresses(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createAddress(customerId: string, dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: { ...dto, customerId },
    });
  }

  async findAll(query: QueryCustomerDto = {}) {
    const where: Prisma.CustomerWhereInput = {};
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.CustomerOrderByWithRelationInput = {
      createdAt: "desc",
    };
    if (query.sortBy === "firstName") {
      orderBy = { firstName: query.sortOrder === "asc" ? "asc" : "desc" };
    }
    if (query.sortBy === "createdAt") {
      orderBy = { createdAt: query.sortOrder === "asc" ? "asc" : "desc" };
    }

    return this.prisma.customer.findMany({
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
      orderBy: { createdAt: "desc" },
    });
  }

  async findOneAdmin(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: { select: { id: true, name: true, productMainImg: true } },
              },
            },
            payments: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) throw new NotFoundException("Customer not found");

    const { deletedAt, ...profile } = customer;
    return profile;
  }
}
