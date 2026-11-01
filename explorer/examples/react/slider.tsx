import { useState } from 'react';
import { Slider } from '@mosaic-home/design-system/react';

export function SliderExample() {
  const [brightness, setBrightness] = useState(60);
  return (
    <Slider
      label="Brightness"
      step={5}
      showValue
      format={(v) => `${v}%`}
      value={brightness}
      onValueChange={setBrightness}
    />
  );
}
