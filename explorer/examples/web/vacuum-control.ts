import { createVacuumControl } from '@mosaic-home/design-system/web';

const vacuum = createVacuumControl({
  name: 'Floor cleaner',
  state: 'docked',
  battery: 96,
  charging: true,
  rooms: [
    { id: 'living', name: 'Living room' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'hall', name: 'Hall' },
  ],
  // An empty list means everywhere.
  onStart: (rooms) => {
    const detail = rooms.length ? `${rooms.length} rooms` : 'Everywhere';
    vacuum.update({ state: 'cleaning', charging: false, detail });
  },
  onPause: () => vacuum.update({ state: 'paused' }),
  onDock: () => vacuum.update({ state: 'returning', detail: undefined }),
});

document.body.append(vacuum.el);
