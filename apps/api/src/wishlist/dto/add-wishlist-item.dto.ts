import { IsInt, Min } from 'class-validator';

export class AddWishlistItemDto {
  /** Id do produto no Payload — sem FK neste banco, como em `OrderItem`. */
  @IsInt()
  @Min(1)
  productId: number;
}
