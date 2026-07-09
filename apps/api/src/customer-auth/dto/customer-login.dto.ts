import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CustomerLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
