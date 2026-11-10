import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Migração de dados: toda promoção já cadastrada passa a "tempo indeterminado".
 * A data de fim é descartada — o `down` não consegue restaurá-la.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "promotions" SET "indefinite" = true, "end_date" = NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "promotions" SET "indefinite" = false;`)
}
