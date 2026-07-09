import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { CustomerRegisterDto } from './dto/customer-register.dto';
import type { CustomerLoginDto } from './dto/customer-login.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: CustomerRegisterDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const customer = await this.prisma.customer.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        picture: true,
      },
    });

    const accessToken = this.signAccessToken(customer);
    const refreshToken = this.signRefreshToken(customer);

    return { accessToken, refreshToken, customer };
  }

  async login(dto: CustomerLoginDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });
    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signAccessToken(customer);
    const refreshToken = this.signRefreshToken(customer);

    return {
      accessToken,
      refreshToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        picture: customer.picture,
      },
    };
  }

  async refresh(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        picture: true,
      },
    });
    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    const accessToken = this.signAccessToken(customer);
    return { accessToken, customer };
  }

  async validateCustomer(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        picture: true,
      },
    });
    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }
    return customer;
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    picture: string | null;
  }) {
    let customer = await this.prisma.customer.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!customer) {
      const existingByEmail = await this.prisma.customer.findUnique({
        where: { email: profile.email },
      });

      if (existingByEmail) {
        customer = await this.prisma.customer.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.googleId,
            picture: profile.picture ?? existingByEmail.picture,
          },
        });
      } else {
        customer = await this.prisma.customer.create({
          data: {
            googleId: profile.googleId,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            picture: profile.picture,
          },
        });
      }
    }

    const accessToken = this.signAccessToken(customer);
    const refreshToken = this.signRefreshToken(customer);

    return {
      accessToken,
      refreshToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        picture: customer.picture,
      },
    };
  }

  async googleIdTokenLogin(idToken: string) {
    const { OAuth2Client } = await import('google-auth-library');
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID') ?? '';
    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return this.findOrCreateGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.given_name ?? null,
      lastName: payload.family_name ?? null,
      picture: payload.picture ?? null,
    });
  }

  async forgotPassword(email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (!customer) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = this.jwt.sign(
      { sub: customer.id, type: 'reset' },
      { expiresIn: '5m' },
    );

    return { resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (payload.type !== 'reset') {
      throw new UnauthorizedException('Invalid token type');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.customer.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  private signAccessToken(customer: { id: string; email: string }) {
    return this.jwt.sign(
      { sub: customer.id, email: customer.email },
      { expiresIn: this.config.get('JWT_CUSTOMER_ACCESS_EXPIRY', '15m') },
    );
  }

  private signRefreshToken(customer: { id: string }) {
    return this.jwt.sign(
      { sub: customer.id, type: 'refresh' },
      { expiresIn: this.config.get('JWT_CUSTOMER_REFRESH_EXPIRY', '7d') },
    );
  }
}
