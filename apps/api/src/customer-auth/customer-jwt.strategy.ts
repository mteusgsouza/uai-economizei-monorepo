import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_CUSTOMER_SECRET') ?? '',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, firstName: true, lastName: true, picture: true },
    });
    if (!customer) {
      throw new UnauthorizedException();
    }
    return customer;
  }
}
