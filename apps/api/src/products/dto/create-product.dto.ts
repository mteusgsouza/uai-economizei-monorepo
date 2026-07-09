import { IsString, IsOptional, IsArray, IsDateString, IsInt, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Genre, type_of_work } from '@workspace/database';
import { PreviewVideoDto } from './preview-video.dto';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsInt()
  @Type(() => Number)
  price: number;

  @IsString()
  image: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(Genre)
  genre?: Genre;

  @IsOptional()
  @IsEnum(type_of_work)
  type_of_work?: type_of_work;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preview_images?: string[];

  @IsString()
  url: string;

  @IsInt()
  publisherId: number;

  @IsOptional()
  @IsDateString()
  publication_date?: string;

  @IsOptional()
  @IsString()
  circle?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviewVideoDto)
  preview_videos?: PreviewVideoDto[];
}
