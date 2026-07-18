import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { FirebaseAdminModule } from "./auth/firebase-admin.module";
import { ProductsModule } from "./products/products.module";
import { BrandsModule } from "./brands/brands.module";
import { CategoriesModule } from "./categories/categories.module";
import { CustomerAuthModule } from "./customer-auth/customer-auth.module";
import { UploadModule } from "./upload/upload.module";
import { OrdersModule } from "./orders/orders.module";
import { CustomersModule } from "./customers/customers.module";
import { CepModule } from "./cep/cep.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FirebaseAdminModule,
    CustomerAuthModule,
    ProductsModule,
    BrandsModule,
    CategoriesModule,
    UploadModule,
    OrdersModule,
    CustomersModule,
    CepModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
