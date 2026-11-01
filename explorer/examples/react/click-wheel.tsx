import { useState } from 'react';
import { ClickWheel } from '@mosaic-home/design-system/react';

export function ClickWheelExample() {
  const [minutes, setMinutes] = useState(25);
  const [started, setStarted] = useState<number | null>(null);
  return (
    <div>
      <ClickWheel
        label="Timer"
        max={120}
        step={5}
        detents={36}
        format={(v) => `${v} min`}
        value={minutes}
        onValueChange={setMinutes}
        center={{ label: 'Start timer', icon: 'play', onPress: () => setStarted(minutes) }}
      />
      {started !== null && <p>Timer started: {started} min</p>}
    </div>
  );
}
