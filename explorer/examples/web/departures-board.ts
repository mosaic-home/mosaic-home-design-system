import { createDeparturesBoard, type Departure } from '@mosaic-home/design-system/web';

let departures: Departure[] = [
  { id: 'a', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 2, live: true },
  { id: 'b', line: 'T3', mode: 'tram', color: 3, destination: 'Mill Lane', minutes: 6, time: '08:46' },
  { id: 'c', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 13, delay: 3 },
  { id: 'd', line: 'R2', mode: 'train', color: 5, destination: 'Brackenmoor', minutes: 21, cancelled: true },
];

const board = createDeparturesBoard({ stop: 'Elm Street', departures, max: 5, updated: 'Updated just now' });

// Departed ones (below 0 minutes) drop off the board by themselves.
setInterval(() => {
  departures = departures.map((d) => ({ ...d, minutes: d.minutes === null ? null : d.minutes - 1 }));
  board.update({ departures, updated: 'Updated a minute ago' });
}, 60_000);

document.body.append(board.el);
