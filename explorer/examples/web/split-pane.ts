import { createList, createSplitPane, createStack, createText } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Office'];
const title = createText('Living room', { variant: 'title' });
const status = createText('Room list at 35%', { variant: 'caption', tone: 'muted' });

const list = createList({
  label: 'Rooms',
  items: rooms.map((room) => ({ title: room, icon: 'home', onClick: () => (title.textContent = room) })),
});

const split = createSplitPane({
  start: list.el,
  end: createStack({ gap: 'sm' }, title, createText('3 lights on, 21.5°.', { tone: 'muted' })).el,
  size: 35,
  min: 25,
  max: 65,
  collapsible: 'start',
  label: 'Resize room list',
  startLabel: 'Rooms',
  onResize: (size) => (status.textContent = `Room list at ${size}%`),
  onCollapse: (collapsed) => (status.textContent = collapsed ? 'Room list folded away' : 'Room list shown'),
});
// The panes fill the split's height, so it needs one.
split.el.style.height = '320px';

document.body.append(split.el, status);
