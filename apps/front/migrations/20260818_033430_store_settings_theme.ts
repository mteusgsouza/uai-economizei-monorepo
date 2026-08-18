import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_store_settings_theme_radius" AS ENUM('square', 'soft', 'round');
  ALTER TABLE "store_settings" ADD COLUMN "theme_primary_color" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "theme_radius" "enum_store_settings_theme_radius" DEFAULT 'square';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" DROP COLUMN "theme_primary_color";
  ALTER TABLE "store_settings" DROP COLUMN "theme_radius";
  DROP TYPE "public"."enum_store_settings_theme_radius";`)
}
