import { ConflictException, NotFoundException } from '@nestjs/common';
import { addressFingerprint } from '@workspace/database';
import { AddressesService } from './addresses.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

const dto: CreateAddressDto = {
  street: 'Rua  das Flores',
  number: '10',
  complement: '',
  neighborhood: 'Centro',
  city: 'Uberlândia',
  state: 'MG',
  postalCode: '38400-000',
  country: 'Brasil',
};

const saved = {
  id: 7,
  customerId: 'c1',
  ...dto,
  isDefault: true,
  fingerprint: addressFingerprint(dto),
};

describe('AddressesService', () => {
  let service: AddressesService;
  let address: Record<string, jest.Mock>;
  let transaction: jest.Mock;

  beforeEach(() => {
    address = {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue(saved),
      update: jest.fn().mockResolvedValue(saved),
      updateMany: jest.fn(),
      delete: jest.fn(),
    };
    transaction = jest.fn();

    service = new AddressesService({
      address,
      $client: { $transaction: transaction },
    } as unknown as PrismaService);
  });

  it('grava pela chave normalizada — o mesmo endereço não duplica', async () => {
    address.findFirst.mockResolvedValue(null);

    await service.create('c1', dto);

    const [args] = address.upsert.mock.calls[0] as [
      {
        where: { customerId_fingerprint: unknown };
        create: { isDefault: boolean };
        update: Record<string, unknown>;
      },
    ];
    expect(args.where.customerId_fingerprint).toEqual({
      customerId: 'c1',
      // CEP só com dígitos, espaço do meio colapsado, tudo minúsculo
      fingerprint: '38400000|rua das flores|10||centro|uberlândia|mg',
    });
    // O primeiro endereço do cliente já entra como padrão
    expect(args.create.isDefault).toBe(true);
    expect(args.update).toMatchObject({ isDefault: true });
  });

  it('com endereço já salvo, o upsert não mexe no padrão', async () => {
    address.findFirst.mockResolvedValue({ id: 1 });

    await service.create('c1', dto);

    const [args] = address.upsert.mock.calls[0] as [
      { create: { isDefault: boolean }; update: Record<string, unknown> },
    ];
    expect(args.create.isDefault).toBe(false);
    expect(args.update).not.toHaveProperty('isDefault');
  });

  it('exclui e promove o mais recente quando era o padrão', async () => {
    address.findFirst
      .mockResolvedValueOnce(saved) // findOwned
      .mockResolvedValueOnce({ id: 9 }); // próximo padrão

    await service.remove('c1', 7);

    expect(address.delete).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(address.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { isDefault: true },
    });
  });

  it('definir padrão desmarca os outros na mesma transação', async () => {
    address.findFirst.mockResolvedValue(saved);

    await service.setDefault('c1', 7);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(address.updateMany).toHaveBeenCalledWith({
      where: { customerId: 'c1', isDefault: true },
      data: { isDefault: false },
    });
  });

  it('endereço de outro cliente não existe para quem pediu', async () => {
    address.findFirst.mockResolvedValue(null);

    await expect(
      service.update('c1', 7, { number: '11' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('editar para cima de um endereço que já existe é conflito', async () => {
    address.findFirst
      .mockResolvedValueOnce(saved) // findOwned
      .mockResolvedValueOnce({ id: 8 }); // colisão

    await expect(
      service.update('c1', 7, { number: '11' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(address.update).not.toHaveBeenCalled();
  });

  it('editar recalcula a chave e mantém o que não veio no corpo', async () => {
    address.findFirst.mockResolvedValueOnce(saved).mockResolvedValueOnce(null);

    await service.update('c1', 7, { number: '11' });

    const [args] = address.update.mock.calls[0] as [
      { data: { fingerprint: string; street: string } },
    ];
    expect(args.data.fingerprint).toBe(
      '38400000|rua das flores|11||centro|uberlândia|mg',
    );
    expect(args.data.street).toBe(dto.street);
  });
});
