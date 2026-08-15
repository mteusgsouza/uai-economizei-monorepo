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
    name: '20260814_011804_drop_banners'
  },
];
