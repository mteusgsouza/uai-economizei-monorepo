import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" ADD COLUMN "identity_name" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "identity_logo_mark" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "identity_logo_word" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "identity_tagline" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "identity_legal_name" varchar;
  ALTER TABLE "store_settings" ADD COLUMN "identity_tax_id" varchar;`)

  // Backfill da loja que já está no ar.
  //
  // As colunas nascem sem DEFAULT de propósito: um default no schema seria o
  // nome de uma loja chumbado no banco de todas as outras. Mas o site que já
  // existe não pode trocar de nome no deploy desta migration — então o nome e
  // a frase que estavam no código viram dado aqui, uma vez.
  //
  // Em banco de loja nova isto não faz nada: o Payload só cria a linha de
  // `store_settings` no primeiro salvamento do global, e até lá não há o que
  // atualizar. A condição `IS NULL` também impede que rodar de novo (rollback
  // e re-aplicação) sobrescreva o que o lojista tiver escrito depois.
  //
  // A sigla e a palavra do logo ficam de fora: "UAI Economizei" já deriva em
  // "UAI" + "Economizei", que é a marca atual (ver `lib/store-identity.ts`).
  //
  // O CNPJ também fica de fora. O rodapé publicava
  // `CNPJ 00.000.000/0001-00`, um placeholder — sem valor cadastrado a linha
  // passa a sair só com o nome, e o número real entra pelo admin.
  await db.execute(sql`
   UPDATE "store_settings"
   SET "identity_name" = 'UAI Economizei',
       "identity_legal_name" = 'Economizei',
       "identity_tagline" = 'Sua loja online de confiança. Preço à vista sempre visível.'
   WHERE "identity_name" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" DROP COLUMN "identity_name";
  ALTER TABLE "store_settings" DROP COLUMN "identity_logo_mark";
  ALTER TABLE "store_settings" DROP COLUMN "identity_logo_word";
  ALTER TABLE "store_settings" DROP COLUMN "identity_tagline";
  ALTER TABLE "store_settings" DROP COLUMN "identity_legal_name";
  ALTER TABLE "store_settings" DROP COLUMN "identity_tax_id";`)
}
