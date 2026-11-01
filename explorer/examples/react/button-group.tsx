import { useState } from 'react';
import { ButtonGroup } from '@mosaic-home/design-system/react';

const ranges = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export function ButtonGroupExample() {
  const [range, setRange] = useState('week');
  return (
    <ButtonGroup
      label="Range"
      items={ranges.map((item) => ({ ...item, pressed: item.id === range }))}
      onClick={setRange}
    />
  );
}
