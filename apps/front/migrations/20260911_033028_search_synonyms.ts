import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "search_synonyms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"terms" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "search_synonyms_id" integer;
  CREATE INDEX "search_synonyms_updated_at_idx" ON "search_synonyms" USING btree ("updated_at");
  CREATE INDEX "search_synonyms_created_at_idx" ON "search_synonyms" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_synonyms_fk" FOREIGN KEY ("search_synonyms_id") REFERENCES "public"."search_synonyms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_search_synonyms_id_idx" ON "payload_locked_documents_rels" USING btree ("search_synonyms_id");`)

  // Lista inicial para o catálogo atual — o lojista amplia pelo admin. Evita
  // abreviação ambígua solta (pc, hd, tela, fonte, memória).
  await db.execute(sql`
   INSERT INTO "search_synonyms" ("terms") VALUES
  ('notebook, laptop'),
  ('computador, desktop, computador de mesa'),
  ('ssd, disco sólido'),
  ('hd externo, disco externo, hd portátil'),
  ('pendrive, pen drive'),
  ('mousepad, mouse pad'),
  ('webcam, câmera web'),
  ('sem fio, wireless'),
  ('fone, fone de ouvido, headset, headphone'),
  ('caixa de som, alto-falante, speaker'),
  ('tv, televisão, televisor'),
  ('videogame, video game, console'),
  ('celular, smartphone, telefone celular'),
  ('capinha, capa de celular'),
  ('película, protetor de tela'),
  ('power bank, powerbank, carregador portátil, bateria externa'),
  ('placa de vídeo, placa gráfica, gpu'),
  ('placa-mãe, placa mãe, motherboard'),
  ('processador, cpu'),
  ('kit de ferramentas, jogo de ferramentas, maleta de ferramentas, conjunto de ferramentas'),
  ('esmerilhadeira, lixadeira angular'),
  ('trena, fita métrica'),
  ('máquina de solda, inversora de solda'),
  ('lavadora de alta pressão, lava jato'),
  ('cinta de amarração, cinta com catraca'),
  ('carregador veicular, carregador automotivo, carregador de carro'),
  ('aspirador automotivo, aspirador veicular, aspirador de carro'),
  ('geladeira, refrigerador'),
  ('micro-ondas, microondas'),
  ('air fryer, airfryer, fritadeira elétrica, fritadeira sem óleo'),
  ('cafeteira, máquina de café'),
  ('ventilador, circulador de ar'),
  ('purificador de água, filtro de água');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_synonyms" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "search_synonyms" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_search_synonyms_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_search_synonyms_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "search_synonyms_id";`)
}
