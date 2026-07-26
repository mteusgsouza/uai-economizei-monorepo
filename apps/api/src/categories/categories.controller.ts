import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Public } from '../auth/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
}
