import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryBrandDto } from './dto/query-brand.dto';
import { Prisma } from '@workspace/database';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: QueryBrandDto = {}) {
    const where: Prisma.BrandWhereInput = {};
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.categorySlug) {
      where.products = {
        some: {
          active: true,
          category: { categorySlug: query.categorySlug },
        },
      };
    }

    let orderBy: Prisma.BrandOrderByWithRelationInput = { name: 'asc' };
    if (query.sortBy === 'name') {
      orderBy = { name: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    if (query.sortBy === 'createdAt') {
      orderBy = { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    return this.prisma.brand.findMany({ where, orderBy });
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: { select: { id: true, name: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand #${id} not found`);
    return brand;
  }

  create(name: string) {
    return this.prisma.brand.create({ data: { name } });
  }

  async update(id: number, name: string) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: { name } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.brand.delete({ where: { id } });
  }
}
