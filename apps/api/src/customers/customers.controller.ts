import type { AuthenticatedRequest } from '../auth/authenticated-request';
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { InternalKeyGuard } from '../auth/internal-key.guard';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly addressesService: AddressesService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest) {
    const firebaseUid = req.firebaseUid!;
    return this.customersService.getProfileByFirebaseUid(firebaseUid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateCustomerDto,
  ) {
    const firebaseUid = req.firebaseUid!;
    return this.customersService.updateProfileByFirebaseUid(firebaseUid, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me/addresses')
  async getAddresses(@Req() req: AuthenticatedRequest) {
    const customerId = await this.resolveCustomerId(req);
    return this.addressesService.list(customerId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('me/addresses')
  async createAddress(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAddressDto,
  ) {
    const customerId = await this.resolveCustomerId(req);
    return this.addressesService.create(customerId, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('me/addresses/:id')
  async updateAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    const customerId = await this.resolveCustomerId(req);
    return this.addressesService.update(customerId, id, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('me/addresses/:id')
  async removeAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const customerId = await this.resolveCustomerId(req);
    return this.addressesService.remove(customerId, id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('me/addresses/:id/default')
  async setDefaultAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const customerId = await this.resolveCustomerId(req);
    return this.addressesService.setDefault(customerId, id);
  }

  private resolveCustomerId(req: AuthenticatedRequest) {
    return this.customersService.getIdByFirebaseUid(req.firebaseUid!);
  }

  // Admin endpoints — só o admin do Payload, via x-internal-key
  @UseGuards(InternalKeyGuard)
  @Get()
  findAll(@Query() query: QueryCustomerDto) {
    return this.customersService.findAll(query);
  }

  @UseGuards(InternalKeyGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOneAdmin(id);
  }
}
