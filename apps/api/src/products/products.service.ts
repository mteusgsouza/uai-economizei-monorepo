import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      include: { publisher: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    return product;
  }

  findAllPublic() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        authors: true,
        categories: true,
        tags: true,
        genre: true,
        label: true,
        publication_date: true,
        url: true,
        publisher: { select: { id: true, name: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOnePublic(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        authors: true,
        categories: true,
        tags: true,
        genre: true,
        label: true,
        publication_date: true,
        url: true,
        type_of_work: true,
        description: true,
        preview_images: true,
        preview_videos: true,
        publisher: { select: { id: true, name: true, category: true } },
      },
    });

    if (!product) throw new NotFoundException(`Product #${id} not found`);

    return product;
  }

  async create(dto: CreateProductDto) {
    const { preview_videos, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        name: productData.name,
        price: productData.price,
        image: productData.image,
        categories: productData.categories ?? [],
        authors: productData.authors ?? [],
        tags: productData.tags ?? [],
        genre: productData.genre ?? null,
        type_of_work: productData.type_of_work ?? null,
        label: productData.label ?? '',
        description: productData.description ?? null,
        preview_images: productData.preview_images ?? [],
        url: productData.url,
        publisherId: productData.publisherId,
        publication_date: productData.publication_date ? new Date(productData.publication_date) : new Date(),
        circle: productData.circle ?? null,
        preview_videos: preview_videos?.length
          ? { create: preview_videos.map((v) => ({ url: v.url })) }
          : undefined,
      },
      include: { preview_videos: true },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    const { preview_videos, ...productData } = dto;

    const data: any = {
      ...(productData.name !== undefined && { name: productData.name }),
      ...(productData.price !== undefined && { price: productData.price }),
      ...(productData.image !== undefined && { image: productData.image }),
      ...(productData.categories !== undefined && { categories: productData.categories }),
      ...(productData.authors !== undefined && { authors: productData.authors }),
      ...(productData.tags !== undefined && { tags: productData.tags }),
      ...(productData.genre !== undefined && { genre: productData.genre }),
      ...(productData.type_of_work !== undefined && { type_of_work: productData.type_of_work }),
      ...(productData.label !== undefined && { label: productData.label }),
      ...(productData.description !== undefined && { description: productData.description }),
      ...(productData.preview_images !== undefined && { preview_images: productData.preview_images }),
      ...(productData.url !== undefined && { url: productData.url }),
      ...(productData.publisherId !== undefined && { publisherId: productData.publisherId }),
      ...(productData.publication_date !== undefined && { publication_date: new Date(productData.publication_date) }),
      ...(productData.circle !== undefined && { circle: productData.circle }),
    };

    if (preview_videos !== undefined) {
      data.preview_videos = {
        deleteMany: {},
        create: preview_videos.map((v) => ({ url: v.url })),
      };
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: { preview_videos: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
