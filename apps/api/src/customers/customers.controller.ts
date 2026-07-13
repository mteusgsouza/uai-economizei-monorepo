import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { CustomersService } from "./customers.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get("me")
  async getProfile(@Req() req: Request) {
    const firebaseUid = (req as any).firebaseUid;
    return this.customersService.getProfileByFirebaseUid(firebaseUid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch("me")
  async updateProfile(@Req() req: Request, @Body() dto: UpdateCustomerDto) {
    const firebaseUid = (req as any).firebaseUid;
    return this.customersService.updateProfileByFirebaseUid(firebaseUid, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("me/addresses")
  async getAddresses(@Req() req: Request) {
    const firebaseUid = (req as any).firebaseUid;
    const customer = await this.customersService.getProfileByFirebaseUid(
      firebaseUid
    );
    return this.customersService.getAddresses(customer.id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("me/addresses")
  async createAddress(
    @Req() req: Request,
    @Body() dto: CreateAddressDto
  ) {
    const firebaseUid = (req as any).firebaseUid;
    const customer = await this.customersService.getProfileByFirebaseUid(
      firebaseUid
    );
    return this.customersService.createAddress(customer.id, dto);
  }

  // Admin endpoints
  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOneAdmin(id);
  }
}
