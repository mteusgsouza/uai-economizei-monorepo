import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "store_settings_card_fees_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"installments" numeric DEFAULT 1,
  	"percent" numeric DEFAULT 0
  );
  
  ALTER TABLE "store_settings" ADD COLUMN "card_fees_hidden" boolean DEFAULT false;
  ALTER TABLE "store_settings" ADD COLUMN "card_fees_cash_label" varchar DEFAULT 'Dinheiro / Transferência / Pix';
  ALTER TABLE "store_settings_card_fees_rates" ADD CONSTRAINT "store_settings_card_fees_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."store_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "store_settings_card_fees_rates_order_idx" ON "store_settings_card_fees_rates" USING btree ("_order");
  CREATE INDEX "store_settings_card_fees_rates_parent_id_idx" ON "store_settings_card_fees_rates" USING btree ("_parent_id");`)

  // O `defaultValue` do array só vale para documento novo, e o global já existe:
  // sem esta carga a loja abriria o admin com a tabela vazia e a página do
  // produto sem forma de pagamento nenhuma. Só semeia quem ainda não tem linha.
  await db.execute(sql`
   INSERT INTO "store_settings_card_fees_rates" ("_order", "_parent_id", "id", "installments", "percent")
  SELECT rate.installments, settings.id, gen_random_uuid()::text, rate.installments, rate.percent
  FROM "store_settings" settings
  CROSS JOIN (VALUES
  	(1, 4.1), (2, 5), (3, 5), (4, 6), (5, 10), (6, 10),
  	(7, 11), (8, 13), (9, 17), (10, 18), (11, 19), (12, 20)
  ) AS rate("installments", "percent")
  WHERE NOT EXISTS (
  	SELECT 1 FROM "store_settings_card_fees_rates" existing
  	WHERE existing."_parent_id" = settings.id
  );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "store_settings_card_fees_rates" CASCADE;
  ALTER TABLE "store_settings" DROP COLUMN "card_fees_hidden";
  ALTER TABLE "store_settings" DROP COLUMN "card_fees_cash_label";`)
}
