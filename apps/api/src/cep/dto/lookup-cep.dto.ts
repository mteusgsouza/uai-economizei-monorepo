import { IsNotEmpty, IsString } from 'class-validator';

/** Declarado como DTO próprio: a API roda com forbidNonWhitelisted. */
export class LookupCepDto {
  @IsString()
  @IsNotEmpty()
  cep: string;
}
