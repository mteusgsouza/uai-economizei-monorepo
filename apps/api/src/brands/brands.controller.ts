import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { QueryBrandDto } from "./dto/query-brand.dto";
import { Public } from "../auth/public.decorator";

@Controller("brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryBrandDto) {
    return this.brandsService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  @Post()
  create(@Body("name") name: string) {
    return this.brandsService.create(name);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body("name") name: string
  ) {
    return this.brandsService.update(id, name);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
