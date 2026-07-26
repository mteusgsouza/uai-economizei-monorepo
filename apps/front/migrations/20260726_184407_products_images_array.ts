import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Converte products.product_images (jsonb) para a tabela de array do Payload.
 *
 * A migration gerada automaticamente dropava a coluna sem copiar nada, o que
 * apagaria as imagens dos produtos existentes. Aqui os dados são copiados
 * primeiro e a coluna antiga é preservada como `product_images_legacy`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "products_product_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar,
      "url" varchar NOT NULL
    );

    ALTER TABLE "products_product_images" ADD CONSTRAINT "products_product_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "products_product_images_order_idx" ON "products_product_images" USING btree ("_order");
    CREATE INDEX "products_product_images_parent_id_idx" ON "products_product_images" USING btree ("_parent_id");
  `)

  await db.execute(sql`
    INSERT INTO "products_product_images" ("_order", "_parent_id", "id", "name", "url")
    SELECT
      img.ord,
      p.id,
      substr(md5(random()::text || clock_timestamp()::text || p.id::text || img.ord::text), 1, 24),
      NULLIF(img.value ->> 'name', ''),
      img.value ->> 'url'
    FROM "products" p
    CROSS JOIN LATERAL jsonb_array_elements(p."product_images") WITH ORDINALITY AS img(value, ord)
    WHERE jsonb_typeof(p."product_images") = 'array'
      AND img.value ->> 'url' IS NOT NULL
      AND img.value ->> 'url' <> '';
  `)

  await db.execute(sql`
    ALTER TABLE "products" RENAME COLUMN "product_images" TO "product_images_legacy";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" RENAME COLUMN "product_images_legacy" TO "product_images";
  `)

  await db.execute(sql`DROP TABLE "products_product_images" CASCADE;`)
}
