import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryCepDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  // Chegam como string: o ValidationPipe global não usa `transform`
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;
}
