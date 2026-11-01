import { useEffect, useState } from 'react';
import { Meter } from '@mosaic-home/design-system/react';

export function MeterExample() {
  const [level, setLevel] = useState(64);
  useEffect(() => {
    const timer = setInterval(() => {
      setLevel((l) => Math.max(30, Math.min(100, l + Math.round((Math.random() - 0.5) * 16))));
    }, 500);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <Meter
        value={level}
        label="Noise level"
        zones={{ warning: 70, danger: 90 }}
        segments={12}
        valueText={`${level} dB`}
      />
      <Meter value={3} max={4} mode="bars" label="Wi-Fi signal" valueText="3 of 4" />
    </>
  );
}
