import { createText } from '@mosaic-home/design-system/web';

const header = document.createElement('header');
header.append(
  createText('Living room', { variant: 'eyebrow', tone: 'muted' }),
  createText('21.5°', { variant: 'display' }),
  createText('Heating to 22° until 23:00.'),
  createText('Window open', { variant: 'label', tone: 'warning' }),
);

document.body.append(header);
