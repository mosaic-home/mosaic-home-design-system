import { useState } from 'react';
import { SegmentedControl } from '@mosaic-home/design-system/react';

const RANGES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export function SegmentedControlExample() {
  const [range, setRange] = useState('week');
  return (
    <SegmentedControl label="Energy range" options={RANGES} value={range} onChange={(value) => setRange(value)} />
  );
}
