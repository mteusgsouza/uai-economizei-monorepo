import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ai_rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"window_start" timestamp(3) with time zone NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ai_rate_limits_id" integer;
  CREATE UNIQUE INDEX "ai_rate_limits_key_idx" ON "ai_rate_limits" USING btree ("key");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_rate_limits_fk" FOREIGN KEY ("ai_rate_limits_id") REFERENCES "public"."ai_rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ai_rate_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_rate_limits_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // A FK sai antes da tabela: depois do DROP ... CASCADE ela já não existiria e o DROP CONSTRAINT falharia.
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ai_rate_limits_fk";
  DROP INDEX "payload_locked_documents_rels_ai_rate_limits_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ai_rate_limits_id";
  DROP TABLE "ai_rate_limits";`)
}
