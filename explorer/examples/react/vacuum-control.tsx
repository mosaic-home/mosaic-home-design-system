import { useState } from 'react';
import { VacuumControl } from '@mosaic-home/design-system/react';
import type { VacuumState } from '@mosaic-home/design-system/web';

const rooms = [
  { id: 'living', name: 'Living room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'hall', name: 'Hall' },
];

export function VacuumControlExample() {
  const [state, setState] = useState<VacuumState>('docked');
  const [chosen, setChosen] = useState<string[]>([]);
  return (
    <VacuumControl
      name="Floor cleaner"
      state={state}
      battery={96}
      charging={state === 'docked'}
      rooms={rooms}
      selectedRooms={chosen}
      onRoomsChange={setChosen}
      onStart={() => setState('cleaning')}
      onPause={() => setState('paused')}
      onDock={() => setState('returning')}
    />
  );
}
