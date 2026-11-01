import { createList, createScrollPanel } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office', 'Bathroom', 'Garden', 'Garage', 'Attic'];

const list = createList({
  items: rooms.map((title, i) => ({ title, subtitle: `${i + 1} devices`, icon: 'home' })),
});

const panel = createScrollPanel({ label: 'Rooms', size: 'medium' }, list.el);

document.body.append(panel.el);
