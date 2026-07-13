import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { QueryProductDto } from "./dto/query-product.dto";
import { Prisma } from "@workspace/database";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllAdmin(query: QueryProductDto) {
    const where: Prisma.ProductWhereInput = {};

    // Text search: split by spaces, each word is an AND condition
    if (query.search) {
      const words = query.search.trim().split(/\s+/);
      where.AND = words.map((word) => ({
        name: { contains: word, mode: "insensitive" },
      }));
    }

    // Brand filter
    if (query.brandId) {
      where.brandId = query.brandId;
    }

    // Category filter
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (query.sortBy) {
      case "name":
        orderBy = { name: query.sortOrder === "asc" ? "asc" : "desc" };
        break;
      case "value":
        orderBy = { value: query.sortOrder === "asc" ? "asc" : "desc" };
        break;
      case "stock":
        orderBy = { stock: query.sortOrder === "asc" ? "asc" : "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    return this.prisma.product.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, title: true, categorySlug: true } },
      },
      orderBy,
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, title: true, categorySlug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, title: true, categorySlug: true } },
      },
    });

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    return product;
  }

  findAllPublic() {
    return this.prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
        isNew: true,
        value: true,
        stock: true,
        productMainImg: true,
        productImages: true,
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, title: true, categorySlug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOnePublic(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, active: true },
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
        isNew: true,
        paidPrice: true,
        value: true,
        stock: true,
        productMainImg: true,
        productImages: true,
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, title: true, categorySlug: true } },
        createdAt: true,
      },
    });

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        active: dto.active ?? true,
        isNew: dto.isNew ?? "false",
        brandId: dto.brandId,
        categoryId: dto.categoryId,
        paidPrice: dto.paidPrice,
        value: dto.value,
        stock: dto.stock,
        productMainImg: dto.productMainImg,
        productImages: (dto.productImages ?? []) as any,
      },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, title: true, categorySlug: true } },
      },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.active !== undefined && { active: dto.active }),
        ...(dto.isNew !== undefined && { isNew: dto.isNew }),
        ...(dto.brandId !== undefined && { brandId: dto.brandId }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.paidPrice !== undefined && { paidPrice: dto.paidPrice }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.productMainImg !== undefined && {
          productMainImg: dto.productMainImg,
        }),
        ...(dto.productImages !== undefined && {
          productImages: dto.productImages as any,
        }),
      },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, title: true, categorySlug: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
