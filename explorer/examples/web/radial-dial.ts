import { createRadialDial } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const volume = createRadialDial({
  label: 'Volume',
  value: 35,
  ticks: 11,
  format: (v) => `${v}%`,
  onChange: (value) => (status.textContent = `Kitchen speaker at ${value}%`),
});

document.body.append(volume.el, status);
