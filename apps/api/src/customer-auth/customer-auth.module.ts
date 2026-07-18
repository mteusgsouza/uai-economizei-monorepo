import { Module } from '@nestjs/common';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Module({
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, FirebaseAuthGuard],
  exports: [CustomerAuthService, FirebaseAuthGuard],
})
export class CustomerAuthModule {}
