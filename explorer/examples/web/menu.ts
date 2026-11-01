import { createIconButton, createMenu, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });
const more = createIconButton({ icon: 'more', label: 'Scene actions' });

createMenu({
  anchor: more.el,
  items: [
    { value: 'edit', label: 'Edit', icon: 'edit', shortcut: 'E' },
    { value: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl+D' },
    { value: 'share', label: 'Share', icon: 'share' },
    { separator: true },
    { value: 'delete', label: 'Delete', icon: 'delete', danger: true },
  ],
  onSelect: (value) => (status.textContent = `Chosen: ${value}`),
});

document.body.append(more.el, status);
