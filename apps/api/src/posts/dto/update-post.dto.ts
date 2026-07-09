import { IsString, IsOptional, IsArray, IsBoolean, IsInt } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productIds?: number[];
}
