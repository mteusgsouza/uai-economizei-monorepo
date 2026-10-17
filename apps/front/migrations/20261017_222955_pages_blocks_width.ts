import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_image_text_width" AS ENUM('full', 'wide', 'medium', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_video_width" AS ENUM('full', 'wide', 'medium', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_cta_width" AS ENUM('full', 'wide', 'medium', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_faq_width" AS ENUM('full', 'wide', 'medium', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_product_highlight_width" AS ENUM('full', 'wide', 'medium', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_product_grid_width" AS ENUM('full', 'wide', 'medium', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_comparison_width" AS ENUM('full', 'wide', 'medium', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_promotion_width" AS ENUM('full', 'wide');
  ALTER TABLE "pages_blocks_image_text" ADD COLUMN "width" "enum_pages_blocks_image_text_width" DEFAULT 'full';
  ALTER TABLE "pages_blocks_video" ADD COLUMN "width" "enum_pages_blocks_video_width" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "width" "enum_pages_blocks_cta_width" DEFAULT 'full';
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "width" "enum_pages_blocks_faq_width" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_product_highlight" ADD COLUMN "width" "enum_pages_blocks_product_highlight_width" DEFAULT 'full';
  ALTER TABLE "pages_blocks_product_grid" ADD COLUMN "width" "enum_pages_blocks_product_grid_width" DEFAULT 'full';
  ALTER TABLE "pages_blocks_comparison" ADD COLUMN "width" "enum_pages_blocks_comparison_width" DEFAULT 'wide';
  ALTER TABLE "pages_blocks_promotion" ADD COLUMN "width" "enum_pages_blocks_promotion_width" DEFAULT 'full';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_image_text" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_video" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_product_highlight" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_product_grid" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_comparison" DROP COLUMN "width";
  ALTER TABLE "pages_blocks_promotion" DROP COLUMN "width";
  DROP TYPE "public"."enum_pages_blocks_image_text_width";
  DROP TYPE "public"."enum_pages_blocks_video_width";
  DROP TYPE "public"."enum_pages_blocks_cta_width";
  DROP TYPE "public"."enum_pages_blocks_faq_width";
  DROP TYPE "public"."enum_pages_blocks_product_highlight_width";
  DROP TYPE "public"."enum_pages_blocks_product_grid_width";
  DROP TYPE "public"."enum_pages_blocks_comparison_width";
  DROP TYPE "public"."enum_pages_blocks_promotion_width";`)
}
