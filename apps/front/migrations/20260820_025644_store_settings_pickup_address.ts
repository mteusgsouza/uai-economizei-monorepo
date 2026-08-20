import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" ADD COLUMN "pickup_address_street" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "pickup_address_number" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "pickup_address_complement" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "pickup_address_neighborhood" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "pickup_address_city" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "pickup_address_state" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "pickup_address_postal_code" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" DROP COLUMN "pickup_address_street";
  ALTER TABLE "store_settings" DROP COLUMN "pickup_address_number";
  ALTER TABLE "store_settings" DROP COLUMN "pickup_address_complement";
  ALTER TABLE "store_settings" DROP COLUMN "pickup_address_neighborhood";
  ALTER TABLE "store_settings" DROP COLUMN "pickup_address_city";
  ALTER TABLE "store_settings" DROP COLUMN "pickup_address_state";
  ALTER TABLE "store_settings" DROP COLUMN "pickup_address_postal_code";`)
}
