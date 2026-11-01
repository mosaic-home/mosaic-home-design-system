import { createSearchField } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Study', 'Hallway'];
const results = document.createElement('ul');

function show(query: string) {
  const q = query.trim().toLowerCase();
  const matches = rooms.filter((room) => room.toLowerCase().includes(q));
  results.replaceChildren(...matches.map((room) => Object.assign(document.createElement('li'), { textContent: room })));
}

const search = createSearchField({
  placeholder: 'Search rooms',
  onInput: (value) => show(value),
  onClear: () => show(''),
});
show('');

document.body.append(search.el, results);
