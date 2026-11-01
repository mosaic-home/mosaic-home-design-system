import { useState } from 'react';
import { ControlCard, Switch } from '@mosaic-home/design-system/react';

export function ControlCardExample() {
  const [on, setOn] = useState(true);
  return (
    <ControlCard
      title="Desk lamp"
      icon="lightbulb"
      tone="warm"
      active={on}
      state={on ? 'On · 70%' : 'Off'}
      control={
        <Switch aria-label="Desk lamp power" checked={on} onChange={(event) => setOn(event.target.checked)} />
      }
    />
  );
}
