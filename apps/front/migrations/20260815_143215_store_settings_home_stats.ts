import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_store_settings_home_stats_items_source" AS ENUM('manual', 'maxDiscount', 'installments', 'pixDiscount');
  CREATE TABLE "store_settings_home_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_store_settings_home_stats_items_source" DEFAULT 'manual',
  	"value" varchar,
  	"label" varchar
  );
  
  ALTER TABLE "store_settings" ADD COLUMN "home_stats_hidden" boolean DEFAULT false;
  ALTER TABLE "store_settings_home_stats_items" ADD CONSTRAINT "store_settings_home_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."store_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "store_settings_home_stats_items_order_idx" ON "store_settings_home_stats_items" USING btree ("_order");
  CREATE INDEX "store_settings_home_stats_items_parent_id_idx" ON "store_settings_home_stats_items" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "store_settings_home_stats_items" CASCADE;
  ALTER TABLE "store_settings" DROP COLUMN "home_stats_hidden";
  DROP TYPE "public"."enum_store_settings_home_stats_items_source";`)
}
