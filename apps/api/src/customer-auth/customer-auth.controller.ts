import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { Public } from '../auth/public.decorator';
import { CustomerJwtAuthGuard } from './customer-jwt-auth.guard';

@Controller('auth/customer')
export class CustomerAuthController {
  constructor(
    private readonly auth: CustomerAuthService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: CustomerRegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, customer: result.customer };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: CustomerLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, customer: result.customer };
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body('credential') credential: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!credential) {
      throw new BadRequestException('Missing credential');
    }
    const result = await this.auth.googleIdTokenLogin(credential);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, customer: result.customer };
  }

  @Public()
  @Get('me')
  @UseGuards(CustomerJwtAuthGuard)
  async me(@Req() req: Request) {
    const customer = (req as any).user;
    return { customer };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: { sub: string; type: string };
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const result = await this.auth.refresh(payload.sub);
    return { accessToken: result.accessToken, customer: result.customer };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/auth' });
    return { message: 'ok' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.auth.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    return this.auth.resetPassword(token, password);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const profile = (req as any).user;
    const result = await this.auth.findOrCreateGoogleUser(profile);
    this.setRefreshCookie(res, result.refreshToken);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accessToken=${result.accessToken}`);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
