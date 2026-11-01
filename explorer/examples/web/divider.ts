import { createButton, createDivider, createText } from '@mosaic-home/design-system/web';

const pairing = document.createElement('div');
pairing.append(
  createButton({ label: 'Scan the QR code', icon: 'camera', variant: 'primary', fullWidth: true }).el,
  createDivider({ label: 'or' }),
  createText('Enter the pairing code shown on the device.', { tone: 'muted' }),
  createDivider(),
  createButton({ label: 'Cancel', variant: 'text' }).el,
);

document.body.append(pairing);
