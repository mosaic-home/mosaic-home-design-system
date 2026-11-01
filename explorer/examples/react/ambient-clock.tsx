import { useEffect, useState } from 'react';
import { AmbientClock } from '@mosaic-home/design-system/react';

const atNight = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};

export function AmbientClockExample() {
  const [night, setNight] = useState(atNight);

  useEffect(() => {
    const check = setInterval(() => setNight(atNight()), 60_000);
    return () => clearInterval(check);
  }, []);

  // Without a `time`, the clock keeps its own.
  return (
    <AmbientClock
      night={night}
      nextEvent={{ title: 'Bins out', when: '19:30' }}
      weather={{ condition: 'partly-cloudy', temperature: 14 }}
    />
  );
}
