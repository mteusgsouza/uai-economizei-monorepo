import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  isNew?: string;

  @IsInt()
  @Type(() => Number)
  brandId: number;

  @IsInt()
  @Type(() => Number)
  categoryId: number;

  @IsInt()
  @Type(() => Number)
  paidPrice: number;

  @IsInt()
  @Type(() => Number)
  value: number;

  @IsInt()
  @Type(() => Number)
  stock: number;

  @IsString()
  productMainImg: string;

  @IsOptional()
  @IsObject()
  productImages?: unknown;
}
