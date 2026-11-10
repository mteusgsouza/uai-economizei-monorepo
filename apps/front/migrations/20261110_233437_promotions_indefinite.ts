import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" ADD COLUMN "indefinite" boolean DEFAULT false;
   -- Promoções que já estavam sem data de fim viram "tempo indeterminado".
   UPDATE "promotions" SET "indefinite" = true WHERE "end_date" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "promotions" DROP COLUMN "indefinite";`)
}
