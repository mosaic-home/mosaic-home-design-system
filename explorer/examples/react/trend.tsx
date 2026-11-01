import { useEffect, useState } from 'react';
import { Trend } from '@mosaic-home/design-system/react';

export function TrendExample() {
  const [values, setValues] = useState([19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.5]);
  useEffect(() => {
    const timer = setInterval(() => {
      const latest = Math.round((20 + Math.random() * 2) * 10) / 10;
      setValues((prev) => [...prev.slice(1), latest]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Trend
      name="Living room"
      value={values[values.length - 1] ?? null}
      unit="°C"
      values={values}
      format={(v) => v.toFixed(1)}
    />
  );
}
