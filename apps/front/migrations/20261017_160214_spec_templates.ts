import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_spec_templates_fields_type" AS ENUM('number', 'text', 'boolean', 'select');
  CREATE TYPE "public"."enum_spec_templates_scope" AS ENUM('model', 'category');
  CREATE TABLE "spec_templates_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_spec_templates_fields_type" DEFAULT 'number' NOT NULL,
  	"unit" varchar,
  	"group" varchar,
  	"key" varchar
  );
  
  CREATE TABLE "spec_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"scope" "enum_spec_templates_scope" DEFAULT 'model' NOT NULL,
  	"category_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "spec_templates_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "spec_template_id" integer;
  ALTER TABLE "products" ADD COLUMN "specs" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "spec_templates_id" integer;
  ALTER TABLE "spec_templates_fields" ADD CONSTRAINT "spec_templates_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."spec_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spec_templates" ADD CONSTRAINT "spec_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "spec_templates_texts" ADD CONSTRAINT "spec_templates_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."spec_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "spec_templates_fields_order_idx" ON "spec_templates_fields" USING btree ("_order");
  CREATE INDEX "spec_templates_fields_parent_id_idx" ON "spec_templates_fields" USING btree ("_parent_id");
  CREATE INDEX "spec_templates_category_idx" ON "spec_templates" USING btree ("category_id");
  CREATE INDEX "spec_templates_updated_at_idx" ON "spec_templates" USING btree ("updated_at");
  CREATE INDEX "spec_templates_created_at_idx" ON "spec_templates" USING btree ("created_at");
  CREATE INDEX "spec_templates_texts_order_parent" ON "spec_templates_texts" USING btree ("order","parent_id");
  ALTER TABLE "products" ADD CONSTRAINT "products_spec_template_id_spec_templates_id_fk" FOREIGN KEY ("spec_template_id") REFERENCES "public"."spec_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spec_templates_fk" FOREIGN KEY ("spec_templates_id") REFERENCES "public"."spec_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_spec_template_idx" ON "products" USING btree ("spec_template_id");
  CREATE INDEX "payload_locked_documents_rels_spec_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("spec_templates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "spec_templates_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "spec_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "spec_templates_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "spec_templates_fields" CASCADE;
  DROP TABLE "spec_templates" CASCADE;
  DROP TABLE "spec_templates_texts" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_spec_template_id_spec_templates_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_spec_templates_fk";

  DROP INDEX IF EXISTS "products_spec_template_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_spec_templates_id_idx";
  ALTER TABLE "products" DROP COLUMN "spec_template_id";
  ALTER TABLE "products" DROP COLUMN "specs";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "spec_templates_id";
  DROP TYPE "public"."enum_spec_templates_fields_type";
  DROP TYPE "public"."enum_spec_templates_scope";`)
}
