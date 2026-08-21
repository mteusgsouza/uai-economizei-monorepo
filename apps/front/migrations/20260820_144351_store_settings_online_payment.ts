import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" ADD COLUMN "online_payment_enabled" boolean DEFAULT true;
  ALTER TABLE "store_settings" ADD COLUMN "online_payment_offline_notice" varchar DEFAULT 'O pagamento é combinado direto com a loja após a confirmação do pedido.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "store_settings" DROP COLUMN "online_payment_enabled";
  ALTER TABLE "store_settings" DROP COLUMN "online_payment_offline_notice";`)
}
