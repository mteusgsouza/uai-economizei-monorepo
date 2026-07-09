import { IsString, IsOptional, IsBoolean, IsObject } from "class-validator";

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsObject()
  theme?: unknown;
}
