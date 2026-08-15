import * as migration_20260720_013830 from './20260720_013830';
import * as migration_20260720_020447 from './20260720_020447';
import * as migration_20260720_020737 from './20260720_020737';
import * as migration_20260720_020955 from './20260720_020955';
import * as migration_20260720_030921 from './20260720_030921';
import * as migration_20260720_044138 from './20260720_044138';
import * as migration_20260726_184407_products_images_array from './20260726_184407_products_images_array';
import * as migration_20260726_194107_products_description_html from './20260726_194107_products_description_html';
import * as migration_20260726_200500_products_subcategory_slug from './20260726_200500_products_subcategory_slug';
import * as migration_20260813_205147_store_settings_and_discount from './20260813_205147_store_settings_and_discount';
import * as migration_20260814_011520_create_promotions from './20260814_011520_create_promotions';
import * as migration_20260814_011804_drop_banners from './20260814_011804_drop_banners';
import * as migration_20260815_143215_store_settings_home_stats from './20260815_143215_store_settings_home_stats';
import * as migration_20260815_144604_store_settings_benefits from './20260815_144604_store_settings_benefits';
import * as migration_20260815_155049_store_settings_card_fees from './20260815_155049_store_settings_card_fees';
import * as migration_20260815_180356_store_settings_shipping_area from './20260815_180356_store_settings_shipping_area';

export const migrations = [
  {
    up: migration_20260720_013830.up,
    down: migration_20260720_013830.down,
    name: '20260720_013830',
  },
  {
    up: migration_20260720_020447.up,
    down: migration_20260720_020447.down,
    name: '20260720_020447',
  },
  {
    up: migration_20260720_020737.up,
    down: migration_20260720_020737.down,
    name: '20260720_020737',
  },
  {
    up: migration_20260720_020955.up,
    down: migration_20260720_020955.down,
    name: '20260720_020955',
  },
  {
    up: migration_20260720_030921.up,
    down: migration_20260720_030921.down,
    name: '20260720_030921',
  },
  {
    up: migration_20260720_044138.up,
    down: migration_20260720_044138.down,
    name: '20260720_044138',
  },
  {
    up: migration_20260726_184407_products_images_array.up,
    down: migration_20260726_184407_products_images_array.down,
    name: '20260726_184407_products_images_array',
  },
  {
    up: migration_20260726_194107_products_description_html.up,
    down: migration_20260726_194107_products_description_html.down,
    name: '20260726_194107_products_description_html',
  },
  {
    up: migration_20260726_200500_products_subcategory_slug.up,
    down: migration_20260726_200500_products_subcategory_slug.down,
    name: '20260726_200500_products_subcategory_slug',
  },
  {
    up: migration_20260813_205147_store_settings_and_discount.up,
    down: migration_20260813_205147_store_settings_and_discount.down,
    name: '20260813_205147_store_settings_and_discount',
  },
  {
    up: migration_20260814_011520_create_promotions.up,
    down: migration_20260814_011520_create_promotions.down,
    name: '20260814_011520_create_promotions',
  },
  {
    up: migration_20260814_011804_drop_banners.up,
    down: migration_20260814_011804_drop_banners.down,
    name: '20260814_011804_drop_banners',
  },
  {
    up: migration_20260815_143215_store_settings_home_stats.up,
    down: migration_20260815_143215_store_settings_home_stats.down,
    name: '20260815_143215_store_settings_home_stats',
  },
  {
    up: migration_20260815_144604_store_settings_benefits.up,
    down: migration_20260815_144604_store_settings_benefits.down,
    name: '20260815_144604_store_settings_benefits',
  },
  {
    up: migration_20260815_155049_store_settings_card_fees.up,
    down: migration_20260815_155049_store_settings_card_fees.down,
    name: '20260815_155049_store_settings_card_fees',
  },
  {
    up: migration_20260815_180356_store_settings_shipping_area.up,
    down: migration_20260815_180356_store_settings_shipping_area.down,
    name: '20260815_180356_store_settings_shipping_area'
  },
];
