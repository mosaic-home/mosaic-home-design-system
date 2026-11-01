import { useState } from 'react';
import { RadioGroup } from '@mosaic-home/design-system/react';

const MODES = [
  { value: 'auto', label: 'Auto', description: 'Follow the weekly schedule.' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'eco', label: 'Eco', description: 'Two degrees lower while nobody is home.' },
  { value: 'off', label: 'Off' },
];

export function RadioGroupExample() {
  const [mode, setMode] = useState('auto');
  return <RadioGroup legend="Heating mode" options={MODES} value={mode} onChange={(value) => setMode(value)} />;
}
