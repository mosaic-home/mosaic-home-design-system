import { useState } from 'react';
import { Button, ProgressRing } from '@mosaic-home/design-system/react';

const total = 8;

export function ProgressRingExample() {
  const [done, setDone] = useState(3);
  return (
    <>
      <ProgressRing label="Rooms set up" value={done} max={total} valueText={`${done}/${total}`} size="large" />
      <Button variant="secondary" disabled={done === total} onClick={() => setDone((n) => Math.min(total, n + 1))}>
        Set up next room
      </Button>
    </>
  );
}
