import { createSpinner, h } from '@mosaic-home/design-system/web';

const panel = h('div', { 'aria-live': 'polite' }, createSpinner({ size: 'large', label: 'Loading rooms' }).el);

// Swap the spinner for the content once it has loaded.
setTimeout(() => {
  panel.replaceChildren(h('p', {}, 'Living room, Kitchen, Bedroom and Garden are ready.'));
}, 1500);

document.body.append(panel);
