import { useState } from 'react';
import { List, ListItem } from '@mosaic-home/design-system/react';

export function ListExample() {
  const [lights, setLights] = useState([
    { name: 'Kitchen light', on: true },
    { name: 'Hallway', on: false },
    { name: 'Desk lamp', on: true },
  ]);
  const toggle = (name: string) => setLights(lights.map((l) => (l.name === name ? { ...l, on: !l.on } : l)));
  return (
    <List label="Lights" inset>
      {lights.map((light) => (
        <ListItem
          key={light.name}
          title={light.name}
          icon={light.on ? 'lightbulb-on' : 'lightbulb'}
          trailing={light.on ? 'On' : 'Off'}
          onClick={() => toggle(light.name)}
        />
      ))}
    </List>
  );
}
