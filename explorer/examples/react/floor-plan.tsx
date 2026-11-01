import { useState } from 'react';
import { mdiDoor, mdiFloorLamp } from '@mdi/js';
import { FloorPlan } from '@mosaic-home/design-system/react';
import type { FloorPlanRoom } from '@mosaic-home/design-system/web';

// Shapes are in centimetres; the plan scales them to fit.
const rooms: FloorPlanRoom[] = [
  { id: 'living', name: 'Living room', shape: { x: 0, y: 0, width: 500, height: 400 }, light: 70 },
  { id: 'kitchen', name: 'Kitchen', shape: { x: 500, y: 0, width: 300, height: 250 }, summary: '22 °C' },
  { id: 'hall', name: 'Hall', shape: { x: 500, y: 250, width: 300, height: 150 } },
  { id: 'bedroom', name: 'Bedroom', shape: { x: 0, y: 400, width: 450, height: 300 }, climate: 'heat' },
  { id: 'bath', name: 'Bathroom', shape: { x: 450, y: 400, width: 350, height: 300 }, alert: true },
];

export function FloorPlanExample() {
  const [selected, setSelected] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const lamp = { id: 'lamp', x: 90, y: 90, icon: mdiFloorLamp, label: 'Floor lamp', tone: 'warm' as const };
  return (
    <FloorPlan
      label="Ground floor"
      rooms={rooms}
      markers={[
        { ...lamp, state: lampOn ? 'On' : 'Off', active: lampOn },
        { id: 'door', x: 790, y: 325, icon: mdiDoor, label: 'Front door', state: 'Locked' },
      ]}
      selected={selected}
      onRoom={setSelected}
      onMarker={(id) => {
        if (id === 'lamp') setLampOn((on) => !on);
      }}
    />
  );
}
