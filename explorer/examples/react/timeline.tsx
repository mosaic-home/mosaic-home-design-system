import { useState } from 'react';
import { Text, Timeline } from '@mosaic-home/design-system/react';
import type { TimelineItem } from '@mosaic-home/design-system/web';

const departures: TimelineItem[] = [
  { time: '07:42', title: 'Line 4 to Harbour Square', detail: 'Platform 2' },
  { time: '07:51', title: 'Line 11 to North Park', detail: '3 min late', tone: 'warning' },
  { time: '08:05', title: 'Line 4 to Harbour Square', detail: 'Cancelled', tone: 'danger' },
  { time: '08:12', title: 'Express to the airport', detail: 'On time', tone: 'success' },
];

export function TimelineExample() {
  const [picked, setPicked] = useState<number | null>(null);
  const departure = picked === null ? null : departures[picked];
  return (
    <>
      <Timeline label="Departures" items={departures} onSelect={setPicked} />
      <Text variant="caption" tone="muted">
        {departure ? `Selected: ${departure.time} ${departure.title}` : 'Press a departure'}
      </Text>
    </>
  );
}
