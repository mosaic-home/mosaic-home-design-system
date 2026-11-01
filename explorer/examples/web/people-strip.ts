import { createPeopleStrip, type PersonEntry } from '@mosaic-home/design-system/web';

const people: PersonEntry[] = [
  { id: 'robin', name: 'Robin Vale', where: 'home', since: '2 h' },
  { id: 'kit', name: 'Kit Harrow', where: 'zone', zone: 'Studio', since: '25 min' },
  { id: 'ash', name: 'Ash Merrow', where: 'away', since: '3 h' },
];

const strip = createPeopleStrip({
  people,
  onSelect: (id) => console.log('Show details for', id),
});

// Later someone arrives home: hand over the new list.
setTimeout(() => {
  const kit: PersonEntry = { id: 'kit', name: 'Kit Harrow', where: 'home', since: 'Just now' };
  strip.update({ people: people.map((p) => (p.id === kit.id ? kit : p)) });
}, 3000);

document.body.append(strip.el);
