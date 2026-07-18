import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, createPrismaClient } from "@workspace/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    this.client = createPrismaClient();
  }

  get product() {
    return this.client.product;
  }

  get brand() {
    return this.client.brand;
  }

  get category() {
    return this.client.category;
  }

  get subcategory() {
    return this.client.subcategory;
  }

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

  get banner() {
    return this.client.banner;
  }

  get cepShipping() {
    return this.client.cepShipping;
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
