import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // O gerador propôs `SET DATA TYPE boolean` sem USING — Postgres não converte
  // enum -> boolean implicitamente, e mesmo que convertesse, "lancamento" e
  // "novidade" não têm equivalente óbvio. Os três valores não-"false" viram
  // `true`: é exatamente a mesma condição que o front já usava para mostrar o
  // selo antes desta migration (`isNew !== 'false'`).
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "is_new" DROP DEFAULT;
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DATA TYPE boolean USING ("is_new" IN ('true', 'lancamento', 'novidade'));
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DEFAULT false;
  DROP TYPE "public"."enum_products_is_new";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_is_new" AS ENUM('false', 'true', 'lancamento', 'novidade');
  ALTER TABLE "products" ALTER COLUMN "is_new" DROP DEFAULT;
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DATA TYPE "public"."enum_products_is_new" USING (CASE WHEN "is_new" THEN 'true' ELSE 'false' END::"public"."enum_products_is_new");
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DEFAULT 'false'::"public"."enum_products_is_new";`)
}
