import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Remove a collection de banners, substituída por `promotions`.
 *
 * `IF EXISTS` nas duas linhas do meio porque o `DROP TABLE ... CASCADE` acima
 * já leva junto a foreign key e o índice que apontavam para `banners` — sem
 * isso a migration quebra dizendo que a constraint não existe.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "banners" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "banners" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_banners_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_banners_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "banners_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "banners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_img" varchar,
  	"url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "banners_id" integer;
  CREATE INDEX "banners_updated_at_idx" ON "banners" USING btree ("updated_at");
  CREATE INDEX "banners_created_at_idx" ON "banners" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("banners_id");`)
}
