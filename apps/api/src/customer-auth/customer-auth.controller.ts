import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { CustomerAuthService } from "./customer-auth.service";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { Public } from "../auth/public.decorator";

@Controller("auth/customer")
export class CustomerAuthController {
  constructor(private readonly auth: CustomerAuthService) {}

  /**
   * Login/Register with Firebase ID token.
   * The client sends the Firebase ID token obtained from Firebase Auth SDK.
   */
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body("idToken") idToken: string) {
    if (!idToken) {
      return { message: "idToken is required" };
    }

    const customer = await this.auth.findOrCreateFromFirebaseToken(idToken);
    return { customer };
  }

  /**
   * Get current customer profile (requires Firebase Auth)
   */
  @UseGuards(FirebaseAuthGuard)
  @Get("me")
  async me(@Req() req: Request) {
    const firebaseUid = (req as any).firebaseUid;
    const customer = await this.auth.getProfile(firebaseUid);
    return { customer };
  }
}
