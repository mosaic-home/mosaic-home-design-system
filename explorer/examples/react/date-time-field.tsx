import { useState } from 'react';
import { DateTimeField } from '@mosaic-home/design-system/react';

export function DateTimeFieldExample() {
  const [time, setTime] = useState('06:45');
  return (
    <DateTimeField
      label="Wake-up light"
      type="time"
      step={60}
      helper="The bedroom lamp starts to brighten at this time."
      error={time ? undefined : 'Choose a time.'}
      value={time}
      onChange={(event) => setTime(event.target.value)}
    />
  );
}
