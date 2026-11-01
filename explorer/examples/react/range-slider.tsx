import { useState } from 'react';
import { RangeSlider } from '@mosaic-home/design-system/react';

export function RangeSliderExample() {
  const [range, setRange] = useState<[number, number]>([19, 23]);
  return (
    <RangeSlider
      label="Comfort range"
      min={14}
      max={28}
      step={0.5}
      minGap={1}
      showValue
      format={(v) => `${v.toFixed(1)}°`}
      labels={{ low: 'Heat below', high: 'Cool above' }}
      value={range}
      onValueChange={setRange}
    />
  );
}
