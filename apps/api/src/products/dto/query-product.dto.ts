import { IsOptional, IsString, IsInt } from "class-validator";
import { Type } from "class-transformer";

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
  sortBy?: string; // "name" | "value" | "stock"

  @IsOptional()
  @IsString()
  sortOrder?: string; // "asc" | "desc"
}
