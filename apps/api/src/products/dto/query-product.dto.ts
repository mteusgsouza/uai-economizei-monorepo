import { IsOptional, IsString, IsInt, IsBoolean } from "class-validator";
import { Type, Transform } from "class-transformer";

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subcategoryId?: number;

  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  precoMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  precoMax?: number;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === "1")
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string; // "name" | "value" | "stock"

  @IsOptional()
  @IsString()
  sortOrder?: string; // "asc" | "desc"
}
