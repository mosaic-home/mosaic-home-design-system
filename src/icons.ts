// The short icon names (`icon: 'power'`). Importing this module once registers them for every component:
//   import '@mosaic-home/design-system/icons';
// Without it, components still draw their own icons; only names passed in by the app need it.

import { ICONS } from './web/icon-set.ts';
import { registerIcons } from './web/icons.ts';

registerIcons(ICONS);

export { ICONS };
export type { IconName } from './web/icons.ts';
