import { useState } from 'react';
import { NumberInput } from '@mosaic-home/design-system/react';

export function NumberInputExample() {
  const [target, setTarget] = useState(21.5);
  return (
    <NumberInput
      label="Target temperature"
      value={target}
      min={7}
      max={30}
      step={0.5}
      unit="°C"
      helper={`Heating to ${target} °C.`}
      onChange={setTarget}
    />
  );
}
