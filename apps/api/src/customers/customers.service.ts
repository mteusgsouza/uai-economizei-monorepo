import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: { addresses: true },
    });

    if (!customer) throw new NotFoundException('Customer not found');

    const { passwordHash, deletedAt, ...profile } = customer;
    return profile;
  }

  async updateProfile(customerId: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.update({
      where: { id: customerId },
      data: dto,
    });

    const { passwordHash, deletedAt, ...profile } = customer;
    return profile;
  }

  async getAddresses(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAddress(customerId: string, dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: { ...dto, customerId },
    });
  }
}
