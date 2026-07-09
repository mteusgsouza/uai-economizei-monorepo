import { IsString, IsOptional, IsArray, IsBoolean, IsInt } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsString()
  authorId: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productIds?: number[];
}
