import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { NotificationsService } from "./notifications.service";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { DeleteSubscriptionDto } from "./dto/delete-subscription.dto";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Public by design - the VAPID public key is not a secret
  @Get("public-key")
  getPublicKey() {
    return this.notificationsService.getPublicKey();
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("subscriptions")
  subscribe(@Req() req: Request, @Body() dto: CreateSubscriptionDto) {
    const firebaseUid = (req as any).firebaseUid;
    return this.notificationsService.upsertSubscription(firebaseUid, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete("subscriptions")
  unsubscribe(@Body() dto: DeleteSubscriptionDto) {
    return this.notificationsService.removeSubscription(dto.endpoint);
  }
}
