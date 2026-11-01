import { useEffect, useState } from 'react';
import { IrrigationZones } from '@mosaic-home/design-system/react';
import type { IrrigationRun, IrrigationZone } from '@mosaic-home/design-system/web';

// Durations are in minutes.
const zones: IrrigationZone[] = [
  { id: 'lawn', name: 'Front lawn', duration: 20 },
  { id: 'beds', name: 'Flower beds', duration: 10 },
  { id: 'veg', name: 'Vegetable patch', duration: 15 },
];

export function IrrigationZonesExample() {
  const [running, setRunning] = useState<IrrigationRun | null>(null);
  const [rainSkip, setRainSkip] = useState(false);
  const watering = running !== null;

  useEffect(() => {
    if (!watering) return;
    const tick = setInterval(
      () => setRunning((r) => (r && r.remaining > 1 ? { ...r, remaining: r.remaining - 1 } : null)),
      1000,
    );
    return () => clearInterval(tick);
  }, [watering]);

  return (
    <IrrigationZones
      name="Garden watering"
      zones={zones}
      running={running}
      nextRun="Tomorrow 06:00"
      rainSkip={rainSkip}
      rainNote="6 mm of rain expected tonight"
      onRun={(id) => setRunning({ zone: id, remaining: zones.find((z) => z.id === id)!.duration * 60 })}
      onStop={() => setRunning(null)}
      onRainSkip={setRainSkip}
    />
  );
}
