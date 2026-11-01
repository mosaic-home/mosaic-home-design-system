import { createIconButton, createPopover, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });
const info = createIconButton({ icon: 'info', label: 'About this sensor' });

// Pressing the anchor opens and closes it.
createPopover({
  anchor: info.el,
  title: 'Air quality',
  content: h('p', {}, 'Measured every five minutes in the hallway. Readings under 50 are good.'),
  onOpen: () => (status.textContent = 'Showing details'),
  onClose: () => (status.textContent = ''),
});

document.body.append(info.el, status);
