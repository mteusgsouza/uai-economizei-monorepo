import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CepService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cepShipping.findMany({
      orderBy: { cepInicial: "asc" },
    });
  }

  async findOne(id: number) {
    const cep = await this.prisma.cepShipping.findUnique({
      where: { id },
    });
    if (!cep) throw new NotFoundException(`CEP #${id} not found`);
    return cep;
  }

  create(data: { cepInicial: number; cepFinal: number; descricao: string; valor: number }) {
    return this.prisma.cepShipping.create({ data });
  }

  async update(id: number, data: { cepInicial?: number; cepFinal?: number; descricao?: string; valor?: number }) {
    await this.findOne(id);
    return this.prisma.cepShipping.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cepShipping.delete({ where: { id } });
  }
}
