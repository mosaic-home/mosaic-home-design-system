import { ForecastStrip } from '@mosaic-home/design-system/react';
import type { ForecastReading } from '@mosaic-home/design-system/web';

const week: ForecastReading[] = [
  { label: 'Today', condition: 'partly-cloudy', value: 16, low: 9, sub: '10%' },
  { label: 'Thu', condition: 'rain', value: 14, low: 8, sub: '80%' },
  { label: 'Fri', condition: 'pouring', value: 12, low: 7, sub: '95%' },
  { label: 'Sat', condition: 'cloudy', value: 13, low: 6 },
  { label: 'Sun', condition: 'clear', value: 17, low: 7 },
];

export function ForecastStripExample() {
  return <ForecastStrip label="Next 5 days" readings={week} subName="rain" />;
}
