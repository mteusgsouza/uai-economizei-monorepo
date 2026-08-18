import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { addressFingerprint, mergeAddressParts } from '@workspace/database';

/**
 * A agenda de endereços do cliente. Toda gravação passa pelo `fingerprint`: o
 * mesmo endereço salvo duas vezes atualiza a linha existente em vez de criar
 * outra.
 *
 * Excluir apaga de verdade — o pedido guarda a própria cópia do endereço, então
 * mexer aqui não altera nem apaga histórico nenhum.
 */
@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(customerId: string, dto: CreateAddressDto) {
    const fingerprint = addressFingerprint(dto);
    const first = !(await this.hasAddress(customerId));

    // Salvar o mesmo endereço de novo cai no `update` e devolve a linha que já
    // existia — é o que impede a lista de multiplicar.
    return this.prisma.address.upsert({
      where: { customerId_fingerprint: { customerId, fingerprint } },
      create: { ...dto, customerId, fingerprint, isDefault: first },
      update: { ...dto, ...(first ? { isDefault: true } : {}) },
    });
  }

  async update(customerId: string, id: number, dto: UpdateAddressDto) {
    const current = await this.findOwned(customerId, id);
    const merged = mergeAddressParts(current, dto);
    const fingerprint = addressFingerprint(merged);

    if (fingerprint !== current.fingerprint) {
      await this.assertNoClash(customerId, id, fingerprint);
    }

    return this.prisma.address.update({
      where: { id },
      data: {
        ...merged,
        country: dto.country ?? current.country,
        fingerprint,
      },
    });
  }

  async remove(customerId: string, id: number) {
    const address = await this.findOwned(customerId, id);

    await this.prisma.address.delete({ where: { id } });
    if (address.isDefault) await this.promoteDefault(customerId);

    return { id, deleted: true };
  }

  async setDefault(customerId: string, id: number) {
    await this.findOwned(customerId, id);

    await this.prisma.$client.$transaction([
      this.prisma.address.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    return this.list(customerId);
  }

  private async findOwned(customerId: string, id: number) {
    const address = await this.prisma.address.findFirst({
      where: { id, customerId },
    });

    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  private async hasAddress(customerId: string) {
    const found = await this.prisma.address.findFirst({
      where: { customerId },
      select: { id: true },
    });
    return found !== null;
  }

  /** Editar um endereço para cima de outro que já está salvo é conflito. */
  private async assertNoClash(
    customerId: string,
    id: number,
    fingerprint: string,
  ) {
    const clash = await this.prisma.address.findFirst({
      where: { customerId, fingerprint, id: { not: id } },
      select: { id: true },
    });

    if (clash) throw new ConflictException('Endereço já cadastrado');
  }

  private async promoteDefault(customerId: string) {
    const next = await this.prisma.address.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (next) {
      await this.prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
}
