import * as migration_20261029_164548_initial from './20261029_164548_initial';
import * as migration_20261119_120000_site_cleanup from './20261119_120000_site_cleanup';
import * as migration_20261120_010000_drop_progress from './20261120_010000_drop_progress';
import * as migration_20261121_030000_comms_part_group from './20261121_030000_comms_part_group';

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
  {
    up: migration_20261120_010000_drop_progress.up,
    down: migration_20261120_010000_drop_progress.down,
    name: '20261120_010000_drop_progress'
  },
  {
    up: migration_20261121_030000_comms_part_group.up,
    down: migration_20261121_030000_comms_part_group.down,
    name: '20261121_030000_comms_part_group'
  },
];
