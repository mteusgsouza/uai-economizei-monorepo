import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class SubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  // Sent by the browser's subscription.toJSON(); tolerated so the global
  // forbidNonWhitelisted ValidationPipe doesn't reject it. Not stored.
  @IsOptional()
  @IsInt()
  expirationTime?: number | null;

  @IsDefined()
  @ValidateNested()
  @Type(() => SubscriptionKeysDto)
  keys: SubscriptionKeysDto;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
