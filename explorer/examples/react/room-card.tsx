import { useState } from 'react';
import { mdiFan } from '@mdi/js';
import { RoomCard } from '@mosaic-home/design-system/react';
import type { RoomToggle } from '@mosaic-home/design-system/web';

export function RoomCardExample() {
  const [toggles, setToggles] = useState<RoomToggle[]>([
    { id: 'lights', label: 'Lights', icon: 'lightbulb', on: true },
    { id: 'fan', label: 'Fan', icon: mdiFan, on: false, tone: 'cool' },
  ]);
  const lightsOn = toggles.find((t) => t.id === 'lights')?.on ? 4 : 0;
  return (
    <RoomCard
      name="Living room"
      temperature={21.5}
      humidity={46}
      lightsOn={lightsOn}
      lightsTotal={4}
      toggles={toggles}
      onOpen={() => location.assign('#/rooms/living-room')}
      onToggle={(id, on) => setToggles((list) => list.map((t) => (t.id === id ? { ...t, on } : t)))}
    />
  );
}
