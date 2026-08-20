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

  /** Frete da faixa de CEP, em centavos. Registro do pedido — a cobrança é à parte. */
  @IsOptional()
  @IsInt()
  @Min(0)
  cepValue?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  paymentDetails?: string;
}
