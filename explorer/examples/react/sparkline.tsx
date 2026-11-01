import { useEffect, useState } from 'react';
import { Sparkline } from '@mosaic-home/design-system/react';

export function SparklineExample() {
  const [readings, setReadings] = useState([19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.9, 22.3]);
  useEffect(() => {
    // A new reading arrives: drop the oldest.
    const timer = setInterval(() => {
      setReadings((prev) => {
        const last = prev[prev.length - 1] ?? 21;
        return [...prev.slice(1), Math.round((last + (Math.random() - 0.5)) * 10) / 10];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Sparkline
      values={readings}
      label="Living room temperature, last 10 hours"
      area
      format={(v) => `${v.toFixed(1)}°`}
    />
  );
}
