import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@workspace/database';

export class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

/** A cópia que fica gravada no pedido. */
export class OrderAddressDto {
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  address?: OrderAddressDto;

  /** Retirada no balcão: o pedido não tem entrega, então nem endereço precisa. */
  @IsOptional()
  @IsBoolean()
  retiraBalcao?: boolean;

  /**
   * @deprecated Ignorado. O frete é calculado no servidor, a partir da faixa
   * de CEP do endereço — aceitá-lo aqui deixava qualquer cliente mandar
   * `cepValue: 0`. O campo só continua declarado para o front já publicado não
   * levar 400 do `forbidNonWhitelisted`; sai numa limpeza posterior.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  cepValue?: number;

  /**
   * Ausente no modo orçamento (pagamento pelo site desligado no admin): o
   * pedido é gravado sem `Payment`. Com o pagamento ligado continua exigido —
   * quem valida é o serviço, que precisa ler a configuração da loja antes.
   */
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentDetails?: string;
}
