import { mdiSofaOutline } from '@mdi/js';
import { createIcon } from '@mosaic-home/design-system/web';

const room = document.createElement('p');
room.append(
  // Any Material Design Icons path works where there is no short name.
  createIcon(mdiSofaOutline, { size: 24 }),
  ' Living room ',
  createIcon('lightbulb-on', { size: 20, label: 'Lights on' }),
);

document.body.append(room);
