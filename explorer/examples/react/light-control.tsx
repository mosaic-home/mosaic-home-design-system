import { useState } from 'react';
import { LightControl } from '@mosaic-home/design-system/react';

export function LightControlExample() {
  const [on, setOn] = useState(true);
  const [brightness, setBrightness] = useState(65);
  const [kelvin, setKelvin] = useState(2700);
  return (
    <LightControl
      label="Bedside lamp"
      on={on}
      brightness={brightness}
      colorTemp={{ value: kelvin, min: 2000, max: 6500 }}
      onToggle={setOn}
      onBrightness={setBrightness}
      onColorTemp={setKelvin}
    />
  );
}
