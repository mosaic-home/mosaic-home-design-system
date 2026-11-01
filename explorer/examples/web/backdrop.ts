import { createBackdrop, createText } from '@mosaic-home/design-system/web';

// Content inside a .mh-backdrop-host stays above the backdrop.
const screen = document.createElement('main');
screen.className = 'mh-backdrop-host';

const backdrop = createBackdrop({ drift: true });
screen.append(backdrop.el, createText('22:40', { variant: 'display' }));

// Dim the canvas while the screen is idle; a touch brightens it again.
const IDLE_MS = 30_000;
let idle = setTimeout(() => backdrop.setDim(true), IDLE_MS);
screen.addEventListener('pointerdown', () => {
  backdrop.setDim(false);
  clearTimeout(idle);
  idle = setTimeout(() => backdrop.setDim(true), IDLE_MS);
});

document.body.append(screen);
