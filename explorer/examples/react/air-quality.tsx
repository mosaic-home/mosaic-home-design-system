import { AirQuality } from '@mosaic-home/design-system/react';

export function AirQualityExample() {
  return (
    <AirQuality
      kind="co2"
      value={640}
      // Oldest first, ending with the reading now.
      trend={[520, 560, 600, 610, 640]}
      trendLabel="Last 2 hours"
    />
  );
}
