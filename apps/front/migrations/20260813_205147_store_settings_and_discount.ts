import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "store_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"free_shipping_enabled" boolean DEFAULT false,
  	"free_shipping_min_value" numeric DEFAULT 19900,
  	"pix_discount_percent" numeric DEFAULT 10,
  	"max_installments" numeric DEFAULT 12,
  	"campaign_name" varchar,
  	"campaign_period" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products" ADD COLUMN "discount_percent" numeric DEFAULT 0;
  ALTER TABLE "products" ADD COLUMN "pix_discount" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "store_settings" CASCADE;
  ALTER TABLE "products" DROP COLUMN "discount_percent";
  ALTER TABLE "products" DROP COLUMN "pix_discount";`)
}
