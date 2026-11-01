import { mdiFan } from '@mdi/js';
import { createRoomCard, type RoomToggle } from '@mosaic-home/design-system/web';

let toggles: RoomToggle[] = [
  { id: 'lights', label: 'Lights', icon: 'lightbulb', on: true },
  { id: 'fan', label: 'Fan', icon: mdiFan, on: false, tone: 'cool' },
];

const card = createRoomCard({
  name: 'Living room',
  temperature: 21.5,
  humidity: 46,
  lightsOn: 3,
  lightsTotal: 4,
  toggles,
  onOpen: () => location.assign('#/rooms/living-room'),
  onToggle: (id, on) => {
    toggles = toggles.map((t) => (t.id === id ? { ...t, on } : t));
    card.update({ toggles });
    if (id === 'lights') card.update({ lightsOn: on ? 4 : 0 });
  },
});

document.body.append(card.el);
