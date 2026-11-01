import { useState } from 'react';
import { Switch } from '@mosaic-home/design-system/react';

export function SwitchExample() {
  const [motion, setMotion] = useState(true);
  const [afterSunset, setAfterSunset] = useState(false);
  return (
    <div>
      <Switch
        row
        icon="lightbulb"
        label="Motion lighting"
        description="Turn the lights on when someone walks in."
        checked={motion}
        onChange={(e) => setMotion(e.target.checked)}
      />
      <Switch
        row
        icon="weather"
        label="Only after sunset"
        checked={afterSunset}
        disabled={!motion}
        onChange={(e) => setAfterSunset(e.target.checked)}
      />
    </div>
  );
}
