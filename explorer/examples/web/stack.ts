import { createButton, createCard, createGrid, createRow, createStack, createText } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Office'];
const grid = createGrid({ min: 'small', gap: 'sm' }, ...rooms.map((title) => createCard({ title }).el));

const addRoom = createButton({
  label: 'Add room',
  icon: 'add',
  variant: 'secondary',
  size: 'small',
  onClick: () => grid.el.append(createCard({ title: `Room ${grid.el.children.length + 1}` }).el),
});

const page = createStack(
  { gap: 'lg' },
  createRow({ justify: 'between' }, createText('Rooms', { variant: 'title' }), addRoom.el).el,
  grid.el,
);

document.body.append(page.el);
