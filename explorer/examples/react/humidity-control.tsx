import { useState } from 'react';
import { HumidityControl } from '@mosaic-home/design-system/react';

const MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'sleep', label: 'Sleep' },
];

export function HumidityControlExample() {
  const [on, setOn] = useState(true);
  const [target, setTarget] = useState(45);
  const [mode, setMode] = useState('normal');
  return (
    <HumidityControl
      label="Nursery humidity"
      current={36}
      target={target}
      on={on}
      action={on ? 'humidifying' : 'off'}
      mode={mode}
      modes={MODES}
      // Called once the taps settle, so one change is sent rather than one per tap.
      onTarget={setTarget}
      onMode={setMode}
      onToggle={setOn}
    />
  );
}
