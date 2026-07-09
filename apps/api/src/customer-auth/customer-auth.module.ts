import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtStrategy } from './customer-jwt.strategy';
import { CustomerJwtAuthGuard } from './customer-jwt-auth.guard';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_CUSTOMER_SECRET') ?? '';
        const expiresIn = config.get<string>('JWT_CUSTOMER_ACCESS_EXPIRY', '15m') || '15m';
        return {
          secret,
          signOptions: { expiresIn } as JwtModuleOptions['signOptions'],
        };
      },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtStrategy,
    CustomerJwtAuthGuard,
    GoogleStrategy,
  ],
  exports: [CustomerAuthService, JwtModule],
})
export class CustomerAuthModule {}
