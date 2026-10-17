import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_image_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_product_highlight_image_position" AS ENUM('left', 'right');
  CREATE TABLE "pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"heading" varchar,
  	"body" jsonb NOT NULL,
  	"image_position" "enum_pages_blocks_image_text_image_position" DEFAULT 'left',
  	"button_text" varchar,
  	"button_link" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"title" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_product_highlight_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_product_highlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"image_position" "enum_pages_blocks_product_highlight_image_position" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_promotion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"promotion_id" integer NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_highlight_benefits" ADD CONSTRAINT "pages_blocks_product_highlight_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_product_highlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_highlight" ADD CONSTRAINT "pages_blocks_product_highlight_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_highlight" ADD CONSTRAINT "pages_blocks_product_highlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_comparison" ADD CONSTRAINT "pages_blocks_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_promotion" ADD CONSTRAINT "pages_blocks_promotion_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_promotion" ADD CONSTRAINT "pages_blocks_promotion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_image_idx" ON "pages_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_highlight_benefits_order_idx" ON "pages_blocks_product_highlight_benefits" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_highlight_benefits_parent_id_idx" ON "pages_blocks_product_highlight_benefits" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_highlight_order_idx" ON "pages_blocks_product_highlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_highlight_parent_id_idx" ON "pages_blocks_product_highlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_highlight_path_idx" ON "pages_blocks_product_highlight" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_highlight_product_idx" ON "pages_blocks_product_highlight" USING btree ("product_id");
  CREATE INDEX "pages_blocks_comparison_order_idx" ON "pages_blocks_comparison" USING btree ("_order");
  CREATE INDEX "pages_blocks_comparison_parent_id_idx" ON "pages_blocks_comparison" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_comparison_path_idx" ON "pages_blocks_comparison" USING btree ("_path");
  CREATE INDEX "pages_blocks_promotion_order_idx" ON "pages_blocks_promotion" USING btree ("_order");
  CREATE INDEX "pages_blocks_promotion_parent_id_idx" ON "pages_blocks_promotion" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_promotion_path_idx" ON "pages_blocks_promotion" USING btree ("_path");
  CREATE INDEX "pages_blocks_promotion_promotion_idx" ON "pages_blocks_promotion" USING btree ("promotion_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_image_text" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_product_highlight_benefits" CASCADE;
  DROP TABLE "pages_blocks_product_highlight" CASCADE;
  DROP TABLE "pages_blocks_comparison" CASCADE;
  DROP TABLE "pages_blocks_promotion" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_image_text_image_position";
  DROP TYPE "public"."enum_pages_blocks_product_highlight_image_position";`)
}
