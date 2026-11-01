import { useState } from 'react';
import { Checkbox } from '@mosaic-home/design-system/react';

const ROOMS = ['Living room', 'Kitchen', 'Bedroom'];

export function CheckboxExample() {
  const [chosen, setChosen] = useState<string[]>(['Kitchen']);
  const toggle = (room: string, on: boolean) =>
    setChosen((rooms) => (on ? [...rooms, room] : rooms.filter((r) => r !== room)));
  return (
    <div>
      <Checkbox
        label="All rooms"
        checked={chosen.length === ROOMS.length}
        indeterminate={chosen.length > 0 && chosen.length < ROOMS.length}
        onChange={(e) => setChosen(e.target.checked ? [...ROOMS] : [])}
      />
      {ROOMS.map((room) => (
        <Checkbox
          key={room}
          label={room}
          checked={chosen.includes(room)}
          onChange={(e) => toggle(room, e.target.checked)}
        />
      ))}
    </div>
  );
}
