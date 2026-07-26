import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Converte products.description de richText (Lexical jsonb) para HTML puro.
 *
 * O conteúdo sempre foi HTML colado como texto dentro de um nó Lexical, o que
 * tornava a edição confusa. Aqui o HTML é extraído para uma coluna de texto.
 * Um ALTER COLUMN direto gravaria o JSON serializado inteiro, por isso a
 * extração é feita antes. A coluna antiga é preservada como
 * `description_lexical_legacy`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "products" ADD COLUMN "description_html_tmp" varchar;`)

  await db.execute(sql`
    UPDATE "products" p
    SET "description_html_tmp" = (
      SELECT string_agg(child ->> 'text', E'\n')
      FROM jsonb_array_elements(p."description" -> 'root' -> 'children') AS node
      CROSS JOIN LATERAL jsonb_array_elements(node -> 'children') AS child
      WHERE child ? 'text'
    )
    WHERE p."description" IS NOT NULL
      AND jsonb_typeof(p."description" -> 'root' -> 'children') = 'array';
  `)

  await db.execute(sql`
    ALTER TABLE "products" RENAME COLUMN "description" TO "description_lexical_legacy";
    ALTER TABLE "products" RENAME COLUMN "description_html_tmp" TO "description";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN "description";
    ALTER TABLE "products" RENAME COLUMN "description_lexical_legacy" TO "description";
  `)
}
