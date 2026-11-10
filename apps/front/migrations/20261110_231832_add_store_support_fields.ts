import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" ADD COLUMN "support_whatsapp" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "support_phone" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "support_email" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "support_hours" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" DROP COLUMN "support_whatsapp";
  ALTER TABLE "store_settings" DROP COLUMN "support_phone";
  ALTER TABLE "store_settings" DROP COLUMN "support_email";
  ALTER TABLE "store_settings" DROP COLUMN "support_hours";`)
}
