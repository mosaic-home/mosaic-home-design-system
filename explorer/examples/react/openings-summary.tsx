import { useState } from 'react';
import { OpeningsSummary } from '@mosaic-home/design-system/react';
import type { OpeningEntry } from '@mosaic-home/design-system/web';

const START: OpeningEntry[] = [
  // Should be shut now: takes the warning tone and goes first.
  { id: 'skylight', name: 'Skylight', kind: 'window', open: true, area: 'Landing', alert: true },
  { id: 'back', name: 'Back door', kind: 'door', open: true, area: 'Kitchen', since: '5 min' },
  { id: 'garage', name: 'Garage door', kind: 'garage', open: false },
];

export function OpeningsSummaryExample() {
  const [items, setItems] = useState(START);
  const shut = (id: string) =>
    setItems((all) => all.map((i) => (i.id === id ? { ...i, open: false, alert: false } : i)));
  return <OpeningsSummary items={items} reason="Rain expected within the hour" onSelect={shut} />;
}
