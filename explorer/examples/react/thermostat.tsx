import { useState } from 'react';
import { Thermostat } from '@mosaic-home/design-system/react';

const MODES = [
  { value: 'off', label: 'Off' },
  { value: 'heat', label: 'Heat' },
  { value: 'cool', label: 'Cool' },
];

export function ThermostatExample() {
  const [target, setTarget] = useState(21);
  const [mode, setMode] = useState('heat');
  return (
    <Thermostat
      label="Living room thermostat"
      current={19.5}
      target={target}
      mode={mode}
      modes={MODES}
      action={mode === 'off' ? 'off' : 'heating'}
      // Called once the taps settle, so one change is sent rather than one per tap.
      onTarget={(value) => {
        if (typeof value === 'number') setTarget(value);
      }}
      onMode={setMode}
    />
  );
}
