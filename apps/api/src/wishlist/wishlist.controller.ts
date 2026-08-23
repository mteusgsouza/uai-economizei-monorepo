import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { CustomersService } from '../customers/customers.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

/**
 * Mesma família de `customers/me/addresses`: recurso do cliente logado, sempre
 * resolvido pelo uid do token — o customerId nunca vem do body.
 */
@UseGuards(FirebaseAuthGuard)
@Controller('customers/me/wishlist')
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly customersService: CustomersService,
  ) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const customerId = await this.resolveCustomerId(req);
    return this.wishlistService.list(customerId);
  }

  @Post()
  async add(@Req() req: AuthenticatedRequest, @Body() dto: AddWishlistItemDto) {
    const customerId = await this.resolveCustomerId(req);
    return this.wishlistService.add(customerId, dto.productId);
  }

  @Delete(':productId')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const customerId = await this.resolveCustomerId(req);
    return this.wishlistService.remove(customerId, productId);
  }

  private resolveCustomerId(req: AuthenticatedRequest) {
    return this.customersService.getIdByFirebaseUid(req.firebaseUid!);
  }
}
