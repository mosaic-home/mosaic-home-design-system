import { createForecastStrip, type ForecastReading } from '@mosaic-home/design-system/web';

const week: ForecastReading[] = [
  { label: 'Today', condition: 'partly-cloudy', value: 16, low: 9, sub: '10%' },
  { label: 'Thu', condition: 'rain', value: 14, low: 8, sub: '80%' },
  { label: 'Fri', condition: 'pouring', value: 12, low: 7, sub: '95%' },
  { label: 'Sat', condition: 'cloudy', value: 13, low: 6 },
  { label: 'Sun', condition: 'clear', value: 17, low: 7 },
];

const forecast = createForecastStrip({ label: 'Next 5 days', readings: week, subName: 'rain' });

// A newer forecast replaces the readings in place.
setTimeout(() => {
  const today: ForecastReading = { ...week[0]!, condition: 'rain', sub: '60%' };
  forecast.update({ label: 'Next 5 days', readings: [today, ...week.slice(1)], subName: 'rain' });
}, 5000);

document.body.append(forecast.el);
