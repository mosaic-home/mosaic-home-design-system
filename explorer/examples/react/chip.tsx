import { useState } from 'react';
import { ChipGroup } from '@mosaic-home/design-system/react';

const KINDS = [
  { value: 'lights', label: 'Lights', icon: 'lightbulb' },
  { value: 'climate', label: 'Climate', icon: 'thermometer' },
  { value: 'media', label: 'Media', icon: 'music' },
  { value: 'fans', label: 'Fans', icon: 'fan' },
];

export function ChipExample() {
  const [kinds, setKinds] = useState(['lights']);
  return <ChipGroup label="Show devices" chips={KINDS} values={kinds} onChange={setKinds} />;
}
