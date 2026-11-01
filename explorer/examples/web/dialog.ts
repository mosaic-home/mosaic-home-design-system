import { createButton, createDialog, h } from '@mosaic-home/design-system/web';

const dialog = createDialog({
  title: 'Save as scene',
  description: 'Keeps the current brightness of every light in this room.',
  content: h('p', {}, 'Living room: three lights at 40%, floor lamp off.'),
  footer: [
    createButton({ label: 'Cancel', variant: 'secondary', onClick: () => dialog.close() }).el,
    createButton({ label: 'Save', onClick: () => dialog.close() }).el,
  ],
});

const open = createButton({ label: 'Save as scene', icon: 'add', onClick: () => dialog.open() });

document.body.append(open.el);
