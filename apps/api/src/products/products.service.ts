import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { QueryProductDto } from "./dto/query-product.dto";
import { Prisma } from "@workspace/database";
import type { Firestore } from "firebase-admin/firestore";
import { FIRESTORE } from "../auth/firebase-admin.module";

export interface SyncResult {
  updated: number;
  notFound: number;
  errors: number;
  details: Array<{
    firebaseName: string;
    firebaseValue: number;
    newValue: number;
    status: "updated" | "not_found" | "error";
    matchedIds?: number[];
    error?: string;
  }>;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FIRESTORE) private readonly firestore: Firestore,
  ) {}

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

    // Subcategory filter
    if (query.subcategoryId) {
      where.subcategoryId = query.subcategoryId;
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
        subcategory: { select: { id: true, title: true, subcatSlug: true } },
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

  findAllPublic(query: QueryProductDto = {}) {
    const where: Prisma.ProductWhereInput = { active: true };

    // Text search: split by spaces, each word is an AND condition
    if (query.search) {
      const words = query.search.trim().split(/\s+/);
      where.AND = words.map((word) => ({
        name: { contains: word, mode: "insensitive" },
      }));
    }

    // Category filter by ID
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Category filter by slug
    if (query.categorySlug) {
      where.category = { categorySlug: query.categorySlug };
    }

    // Subcategory filter
    if (query.subcategoryId) {
      where.subcategoryId = query.subcategoryId;
    }

    // Brand filter by ID
    if (query.brandId) {
      where.brandId = query.brandId;
    }

    // Brand filter by name
    if (query.brandName) {
      where.brand = { name: { contains: query.brandName, mode: "insensitive" } };
    }

    // Price range
    if (query.precoMin !== undefined || query.precoMax !== undefined) {
      const valueFilter: { gte?: number; lte?: number } = {};
      if (query.precoMin !== undefined) valueFilter.gte = query.precoMin;
      if (query.precoMax !== undefined) valueFilter.lte = query.precoMax;
      where.value = valueFilter;
    }

    // In stock only
    if (query.inStock) {
      where.stock = { gt: 0 };
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
        subcategory: { select: { id: true, title: true, subcatSlug: true } },
      },
      orderBy,
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
        subcategoryId: dto.subcategoryId ?? null,
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
        ...(dto.subcategoryId !== undefined && { subcategoryId: dto.subcategoryId }),
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

  async syncPricesFromFirebase(): Promise<SyncResult> {
    const result: SyncResult = {
      updated: 0,
      notFound: 0,
      errors: 0,
      details: [],
    };

    const snapshot = await this.firestore.collection("products").get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const firebaseName = data.name as string;
      const firebaseValue = Number(data.value ?? 0);
      const firebasePaidPrice = Number(data.paidPrice ?? 0);

      if (!firebaseName) {
        result.errors++;
        result.details.push({
          firebaseName: "(sem nome)",
          firebaseValue,
          newValue: 0,
          status: "error",
          error: "Documento sem campo 'name'",
        });
        continue;
      }

      // Converter reais → centavos
      const newValue = Math.round(firebaseValue * 100);
      const newPaidPrice = Math.round(firebasePaidPrice * 100);

      try {
        // Buscar produtos no banco Neon pelo nome (case-insensitive)
        const dbProducts = await this.prisma.product.findMany({
          where: { name: { equals: firebaseName, mode: "insensitive" } },
          select: { id: true, value: true },
        });

        if (dbProducts.length === 0) {
          result.notFound++;
          result.details.push({
            firebaseName,
            firebaseValue,
            newValue,
            status: "not_found",
          });
          continue;
        }

        // Atualizar todos os produtos com mesmo nome
        for (const dbProduct of dbProducts) {
          await this.prisma.product.update({
            where: { id: dbProduct.id },
            data: { value: newValue, paidPrice: newPaidPrice },
          });
        }

        result.updated += dbProducts.length;
        result.details.push({
          firebaseName,
          firebaseValue,
          newValue,
          status: "updated",
          matchedIds: dbProducts.map((p) => p.id),
        });
      } catch (err: any) {
        result.errors++;
        result.details.push({
          firebaseName,
          firebaseValue,
          newValue,
          status: "error",
          error: err.message,
        });
      }
    }

    return result;
  }
}
