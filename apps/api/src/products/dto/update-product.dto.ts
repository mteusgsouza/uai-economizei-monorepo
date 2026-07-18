import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  isNew?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  brandId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  subcategoryId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  paidPrice?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  value?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsString()
  productMainImg?: string;

  @IsOptional()
  productImages?: unknown;
}
