import { useState } from 'react';
import { Button, EmptyState } from '@mosaic-home/design-system/react';

export function EmptyStateExample() {
  const [lights, setLights] = useState<string[]>([]);
  const addLight = () => setLights((list) => [...list, `Desk lamp ${list.length + 1}`]);
  if (lights.length === 0) {
    return (
      <EmptyState
        icon="lightbulb"
        title="No lights yet"
        text="Add a light to control it from here."
        action={
          <Button icon="add" onClick={addLight}>
            Add light
          </Button>
        }
      />
    );
  }
  return (
    <ul>
      {lights.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
