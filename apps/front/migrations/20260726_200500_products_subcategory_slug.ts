import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Troca `subcategory_id` (numérico, legado) por `subcategory` (slug).
 *
 * O campo antigo guardava um id que não correspondia a nada no Payload — as
 * subcategorias são itens de um array dentro de Categories, cujo id é string.
 * Nenhum dos 1131 produtos tinha o campo preenchido, então não há dado a migrar.
 * O slug é estável mesmo que as subcategorias sejam reordenadas.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN "subcategory" varchar;
    ALTER TABLE "products" DROP COLUMN "subcategory_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN "subcategory_id" numeric;
    ALTER TABLE "products" DROP COLUMN "subcategory";
  `)
}
