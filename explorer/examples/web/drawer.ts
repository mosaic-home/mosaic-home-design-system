import { createButton, createDrawer, h } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Garden'];

const drawer = createDrawer({
  side: 'left',
  title: 'Rooms',
  content: h(
    'nav',
    { 'aria-label': 'Rooms' },
    ...rooms.map((room) => h('p', {}, h('a', { href: `#${room.toLowerCase().replace(' ', '-')}` }, room))),
  ),
});
// Following a link closes the drawer.
drawer.body.addEventListener('click', (event) => {
  if ((event.target as Element).closest('a')) drawer.close();
});

const open = createButton({ label: 'Rooms', icon: 'menu', variant: 'secondary', onClick: () => drawer.open() });

document.body.append(open.el);
