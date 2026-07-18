import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Prisma } from '@workspace/database';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: QueryCategoryDto = {}) {
    const where: Prisma.CategoryWhereInput = {};
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    let orderBy: Prisma.CategoryOrderByWithRelationInput = { title: 'asc' };
    if (query.sortBy === 'title') {
      orderBy = { title: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    if (query.sortBy === 'createdAt') {
      orderBy = { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    return this.prisma.category.findMany({
      where,
      include: { subcategories: true },
      orderBy,
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
        products: { select: { id: true, name: true } },
      },
    });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  async create(data: {
    title: string;
    categorySlug: string;
    image?: string;
    subcategories?: { title: string; subcatSlug: string }[];
  }) {
    return this.prisma.category.create({
      data: {
        title: data.title,
        categorySlug: data.categorySlug,
        image: data.image,
        subcategories: data.subcategories
          ? { create: data.subcategories }
          : undefined,
      },
      include: { subcategories: true },
    });
  }

  async update(
    id: number,
    data: { title?: string; categorySlug?: string; image?: string },
  ) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data,
      include: { subcategories: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
