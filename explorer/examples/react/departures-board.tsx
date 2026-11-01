import { useEffect, useState } from 'react';
import { DeparturesBoard } from '@mosaic-home/design-system/react';
import type { Departure } from '@mosaic-home/design-system/web';

const minuteLater = (d: Departure): Departure => ({ ...d, minutes: d.minutes === null ? null : d.minutes - 1 });

export function DeparturesBoardExample() {
  const [departures, setDepartures] = useState<Departure[]>([
    { id: 'a', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 2, live: true },
    { id: 'b', line: 'T3', mode: 'tram', color: 3, destination: 'Mill Lane', minutes: 6, time: '08:46' },
    { id: 'c', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 13, delay: 3 },
    { id: 'd', line: 'R2', mode: 'train', color: 5, destination: 'Brackenmoor', minutes: 21, cancelled: true },
  ]);

  // Departed ones (below 0 minutes) drop off the board by themselves.
  useEffect(() => {
    const tick = setInterval(() => setDepartures((list) => list.map(minuteLater)), 60_000);
    return () => clearInterval(tick);
  }, []);

  return <DeparturesBoard stop="Elm Street" departures={departures} max={5} updated="Updated just now" />;
}
