import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, createPrismaClient } from '@workspace/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    this.client = createPrismaClient();
  }

  // Products, Brands, Categories, CEP, Banners → migrados para Payload CMS

  get customer() {
    return this.client.customer;
  }

  get address() {
    return this.client.address;
  }

  get order() {
    return this.client.order;
  }

  get orderItem() {
    return this.client.orderItem;
  }

  get payment() {
    return this.client.payment;
  }

  get pushSubscription() {
    return this.client.pushSubscription;
  }

  get $client() {
    return this.client;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
