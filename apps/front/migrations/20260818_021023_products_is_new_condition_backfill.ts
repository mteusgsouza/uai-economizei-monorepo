import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Recupera o estado de conservação dos produtos.
 *
 * No Firebase, `isNew` era texto com "novo"/"usado". Na migração para o Payload
 * o campo virou um enum `false|true|lancamento|novidade`, que não comportava
 * esses valores — todos os 1131 produtos caíram no default `'false'` e a
 * informação sumiu do catálogo em produção.
 *
 * O dado original sobreviveu na tabela legada `"Product"` (import do Firebase
 * via Prisma), onde `isNew` ainda é texto: 991 "novo", 108 "usado" e 32 "false"
 * (ausência de valor no Firebase, não "usado"). A junção é 1:1 por `id` + `name`
 * — conferida nas 1131 linhas. Só `id` bastaria, mas `name` é a trava contra
 * casar a linha errada se as sequências divergirem.
 *
 * Decisão de negócio: os 32 sem informação entram como novos, o caso
 * predominante do catálogo.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "is_new" SET DEFAULT true;`)

  // A tabela legada pode não existir em bancos criados do zero (branch de teste,
  // ambiente novo). Sem ela não há o que recuperar, e a migration segue.
  const legacy = await db.execute(sql`
    SELECT to_regclass('public."Product"') IS NOT NULL AS exists;`)

  if (!legacy.rows?.[0]?.exists) {
    payload.logger.info('Tabela legada "Product" ausente — backfill de is_new ignorado.')
    return
  }

  await db.execute(sql`
    UPDATE "products" p
    SET "is_new" = (l."isNew" IS DISTINCT FROM 'usado')
    FROM "Product" l
    WHERE l.id = p.id AND l.name = p.name;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Estado anterior: a coluna inteira em `false`, como ficou depois da conversão
  // para boolean e antes deste backfill.
  await db.execute(sql`
   UPDATE "products" SET "is_new" = false;
  ALTER TABLE "products" ALTER COLUMN "is_new" SET DEFAULT false;`)
}
