import { Controller, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { InternalKeyGuard } from '../auth/internal-key.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(InternalKeyGuard)
  @Post('sync-prices')
  syncPrices() {
    return this.productsService.syncPricesFromFirebase();
  }

  @UseGuards(InternalKeyGuard)
  @Post('sync-subcategories')
  syncSubcategories() {
    return this.productsService.syncSubcategoriesFromFirebase();
  }
}
