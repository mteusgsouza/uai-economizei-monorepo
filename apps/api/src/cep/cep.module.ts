import { Module } from '@nestjs/common';
import { CepController } from './cep.controller';
import { CepService } from './cep.service';

@Module({
  controllers: [CepController],
  providers: [CepService],
  // OrdersModule usa o `lookup` para calcular o frete do pedido no servidor.
  exports: [CepService],
})
export class CepModule {}
