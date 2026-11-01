import { useState } from 'react';
import { Button, Steps } from '@mosaic-home/design-system/react';

const STEPS = [
  { label: 'Connect', description: 'Plug in the hub' },
  { label: 'Network', description: 'Wi-Fi and password' },
  { label: 'Rooms', optional: true },
  { label: 'Done' },
];

export function StepsExample() {
  const [current, setCurrent] = useState(1);
  return (
    <div>
      <Steps label="Hub setup" steps={STEPS} current={current} onSelect={setCurrent} />
      <Button variant="primary" onClick={() => setCurrent((n) => Math.min(n + 1, STEPS.length))}>
        Next
      </Button>
    </div>
  );
}
