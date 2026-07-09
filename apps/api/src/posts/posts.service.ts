import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.post.findMany({
      include: { author: true, products: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true, products: true },
    });

    if (!post) throw new NotFoundException(`Post #${id} not found`);

    return post;
  }

  async create(dto: CreatePostDto) {
    const { productIds, ...data } = dto;

    return this.prisma.post.create({
      data: {
        ...data,
        published: data.published ?? false,
        products: productIds
          ? { connect: productIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { author: true, products: true },
    });
  }

  async update(id: number, dto: UpdatePostDto) {
    await this.findOne(id);

    const { productIds, ...data } = dto;

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(productIds !== undefined && {
          products: { set: productIds.map((pid) => ({ id: pid })) },
        }),
      },
      include: { author: true, products: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.post.delete({ where: { id } });
  }
}
