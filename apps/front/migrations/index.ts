import * as migration_20260720_013830 from './20260720_013830';
import * as migration_20260720_020447 from './20260720_020447';
import * as migration_20260720_020737 from './20260720_020737';
import * as migration_20260720_020955 from './20260720_020955';
import * as migration_20260720_030921 from './20260720_030921';
import * as migration_20260720_044138 from './20260720_044138';
import * as migration_20260726_184407_products_images_array from './20260726_184407_products_images_array';

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
    name: '20260726_184407_products_images_array'
  },
];
