import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryCepDto } from "./dto/query-cep.dto";
import { Prisma } from "@workspace/database";

@Injectable()
export class CepService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: QueryCepDto = {}) {
    const where: Prisma.CepShippingWhereInput = {};
    if (query.search) {
      where.descricao = { contains: query.search, mode: "insensitive" };
    }

    let orderBy: Prisma.CepShippingOrderByWithRelationInput = {
      cepInicial: "asc",
    };
    if (query.sortBy === "cepInicial") {
      orderBy = { cepInicial: query.sortOrder === "asc" ? "asc" : "desc" };
    }
    if (query.sortBy === "valor") {
      orderBy = { valor: query.sortOrder === "asc" ? "asc" : "desc" };
    }

    return this.prisma.cepShipping.findMany({ where, orderBy });
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
