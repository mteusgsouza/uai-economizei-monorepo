import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';
import { Public } from '../auth/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAllPublic(query);
  }

  @Public()
  @Get('home')
  getHome() {
    return this.productsService.getHomeData();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOnePublic(id);
  }

  @Post('sync-prices')
  syncPrices() {
    return this.productsService.syncPricesFromFirebase();
  }
}
