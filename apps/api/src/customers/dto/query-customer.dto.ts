import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryCustomerDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** 'true' ou 'false' — filtra por conta verificada */
  @IsOptional()
  @IsString()
  verified?: string;

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
