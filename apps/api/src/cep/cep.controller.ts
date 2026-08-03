import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CepService } from './cep.service';
import { QueryCepDto } from './dto/query-cep.dto';
import { LookupCepDto } from './dto/lookup-cep.dto';
import { Public } from '../auth/public.decorator';
import { InternalKeyGuard } from '../auth/internal-key.guard';

@Controller('cep')
export class CepController {
  constructor(private readonly cepService: CepService) {}

  // Admin: tabela de fretes completa, paginada — só o Payload, via x-internal-key
  @UseGuards(InternalKeyGuard)
  @Get()
  findAll(@Query() query: QueryCepDto) {
    return this.cepService.findAll(query);
  }

  // Público: consulta pontual de um CEP, usada no checkout (1 resultado)
  // Antes de :id, senão "lookup" seria interpretado como id
  @Public()
  @Get('lookup')
  lookup(@Query() query: LookupCepDto) {
    return this.cepService.lookup(query.cep);
  }

  @UseGuards(InternalKeyGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cepService.findOne(id);
  }
}
