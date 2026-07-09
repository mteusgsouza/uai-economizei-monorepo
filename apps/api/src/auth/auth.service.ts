import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: { id: true, email: true, firstName: true, lastName: true, picture: true },
    });

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, picture: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.signAccessToken(user);
    return { accessToken, user };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, picture: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Don't reveal whether the email exists
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = this.jwt.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '5m' },
    );

    // In production this would be emailed. For MVP we return the token.
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

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  private signAccessToken(user: { id: string; email: string }) {
    return this.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRY', '15m') },
    );
  }

  private signRefreshToken(user: { id: string }) {
    return this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d') },
    );
  }
}
