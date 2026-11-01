import { useState } from 'react';
import { ToggleGroup } from '@mosaic-home/design-system/react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ value: day, label: day }));

export function ToggleGroupExample() {
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  return <ToggleGroup label="Repeat on" type="multiple" options={DAYS} values={days} onChange={setDays} />;
}
