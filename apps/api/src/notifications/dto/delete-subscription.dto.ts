import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}
