import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_products_is_new" ADD VALUE 'true' BEFORE 'lancamento';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "is_new" SET DATA TYPE text;
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DEFAULT 'false'::text;
  DROP TYPE "public"."enum_products_is_new";
  CREATE TYPE "public"."enum_products_is_new" AS ENUM('false', 'lancamento', 'novidade');
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DEFAULT 'false'::"public"."enum_products_is_new";
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DATA TYPE "public"."enum_products_is_new" USING "is_new"::"public"."enum_products_is_new";`)
}
