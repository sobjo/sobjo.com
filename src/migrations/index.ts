import * as migration_20261029_164548_initial from './20261029_164548_initial';
import * as migration_20261119_120000_site_cleanup from './20261119_120000_site_cleanup';

export const migrations = [
  {
    up: migration_20261029_164548_initial.up,
    down: migration_20261029_164548_initial.down,
    name: '20261029_164548_initial'
  },
  {
    up: migration_20261119_120000_site_cleanup.up,
    down: migration_20261119_120000_site_cleanup.down,
    name: '20261119_120000_site_cleanup'
  },
];
