import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CepService } from './cep.service';
import { QueryCepDto } from './dto/query-cep.dto';
import { LookupCepDto } from './dto/lookup-cep.dto';
import { Public } from '../auth/public.decorator';

@Controller('cep')
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryCepDto) {
    return this.cepService.findAll(query);
  }

  // Antes de :id, senão "lookup" seria interpretado como id
  @Public()
  @Get('lookup')
  lookup(@Query() query: LookupCepDto) {
    return this.cepService.lookup(query.cep);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cepService.findOne(id);
  }
}
