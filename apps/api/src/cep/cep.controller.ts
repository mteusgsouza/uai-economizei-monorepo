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
import { CepService } from "./cep.service";
import { QueryCepDto } from "./dto/query-cep.dto";
import { Public } from "../auth/public.decorator";

@Controller("cep")
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryCepDto) {
    return this.cepService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.cepService.findOne(id);
  }

  @Post()
  create(
    @Body("cepInicial") cepInicial: number,
    @Body("cepFinal") cepFinal: number,
    @Body("descricao") descricao: string,
    @Body("valor") valor: number,
  ) {
    return this.cepService.create({ cepInicial, cepFinal, descricao, valor });
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body("cepInicial") cepInicial?: number,
    @Body("cepFinal") cepFinal?: number,
    @Body("descricao") descricao?: string,
    @Body("valor") valor?: number,
  ) {
    return this.cepService.update(id, { cepInicial, cepFinal, descricao, valor });
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.cepService.remove(id);
  }
}
