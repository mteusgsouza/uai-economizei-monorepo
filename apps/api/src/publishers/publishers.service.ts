import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublishersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.publisher.findMany({
      // include: {  },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const publisher = await this.prisma.publisher.findUnique({
      where: { id },
      // include: { author: true },
    });

    if (!publisher) throw new NotFoundException(`Publisher #${id} not found`);

    return publisher;
  }
}
