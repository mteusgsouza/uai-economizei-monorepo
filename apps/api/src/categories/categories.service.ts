import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { title: "asc" },
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
    subcategories?: { title: string; subcatSlug: string }[];
  }) {
    return this.prisma.category.create({
      data: {
        title: data.title,
        categorySlug: data.categorySlug,
        subcategories: data.subcategories
          ? { create: data.subcategories }
          : undefined,
      },
      include: { subcategories: true },
    });
  }

  async update(
    id: number,
    data: { title?: string; categorySlug?: string }
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
