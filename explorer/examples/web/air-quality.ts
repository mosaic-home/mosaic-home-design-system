import { createAirQuality } from '@mosaic-home/design-system/web';

const air = createAirQuality({
  kind: 'co2',
  value: 640,
  // Oldest first, ending with the reading now.
  trend: [520, 560, 600, 610, 640],
  trendLabel: 'Last 2 hours',
});

document.body.append(air.el);
