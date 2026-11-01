import { useState } from 'react';
import { DurationField } from '@mosaic-home/design-system/react';
import { formatDuration } from '@mosaic-home/design-system/web';

export function DurationFieldExample() {
  const [seconds, setSeconds] = useState<number | null>(1500);
  return (
    <DurationField
      label="Timer"
      value={seconds}
      presets={[300, 600, 900, 1800, 3600]}
      max={4 * 3600}
      helper={seconds === null ? 'Try 90, 1h 30 or 0:45.' : `Rings in ${formatDuration(seconds, 'long')}.`}
      onChange={setSeconds}
    />
  );
}
