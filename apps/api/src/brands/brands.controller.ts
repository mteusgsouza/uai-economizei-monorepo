import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import { BrandsService } from "./brands.service";
import { Public } from "../auth/public.decorator";

@Controller("brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  findAll() {
    return this.brandsService.findAll();
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
