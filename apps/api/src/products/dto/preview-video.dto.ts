import { IsString } from 'class-validator';

export class PreviewVideoDto {
  @IsString()
  url: string;
}
