import { useEffect, useState } from 'react';
import { LevelMeter } from '@mosaic-home/design-system/react';

export function LevelMeterExample() {
  const [levels, setLevels] = useState([-Infinity, -Infinity]);
  useEffect(() => {
    // Levels in dBFS, for example from an audio analyser; the meter holds the peaks itself.
    let frame = 0;
    const tick = (now: number) => {
      const base = -18 + 8 * Math.sin(now / 900);
      setLevels([Math.min(0, base + Math.random() * 8), Math.min(0, base - 3 + Math.random() * 8)]);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <LevelMeter levels={levels} channels={['L', 'R']} label="Speaker output" scale />;
}
