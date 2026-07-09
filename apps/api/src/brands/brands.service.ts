import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
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
