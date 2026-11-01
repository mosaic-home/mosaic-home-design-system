import { createReorderableList, createStack, createText } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office'];
const order = createText(`Order: ${rooms.join(', ')}`, { variant: 'caption', tone: 'muted' });

const list = createReorderableList({
  label: 'Room order on the dashboard',
  items: rooms.map((room) => ({ id: room, label: room, icon: 'home' })),
  // Ids are the room names here, so the new order reads directly.
  onChange: (ids) => (order.textContent = `Order: ${ids.join(', ')}`),
});

document.body.append(createStack({ gap: 'md' }, list.el, order).el);
