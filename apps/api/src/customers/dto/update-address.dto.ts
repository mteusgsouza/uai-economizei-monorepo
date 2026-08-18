import { IsString, IsOptional } from 'class-validator';

/**
 * PATCH parcial: qualquer campo pode vir sozinho. Escrito à mão em vez de
 * `PartialType` — `@nestjs/mapped-types` não é dependência do projeto.
 */
export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
