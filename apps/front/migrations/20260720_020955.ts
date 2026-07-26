import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "product_descriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" varchar NOT NULL,
  	"description" jsonb,
  	"features" jsonb,
  	"specs" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "product_descriptions_id" integer;
  CREATE UNIQUE INDEX "product_descriptions_product_id_idx" ON "product_descriptions" USING btree ("product_id");
  CREATE INDEX "product_descriptions_updated_at_idx" ON "product_descriptions" USING btree ("updated_at");
  CREATE INDEX "product_descriptions_created_at_idx" ON "product_descriptions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_descriptions_fk" FOREIGN KEY ("product_descriptions_id") REFERENCES "public"."product_descriptions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_product_descriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("product_descriptions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "product_descriptions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "product_descriptions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_descriptions_fk";
  
  DROP INDEX "payload_locked_documents_rels_product_descriptions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "product_descriptions_id";`)
}
