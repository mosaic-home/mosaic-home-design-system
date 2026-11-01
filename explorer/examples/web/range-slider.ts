import { createRangeSlider } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const comfort = createRangeSlider({
  label: 'Comfort range',
  min: 14,
  max: 28,
  step: 0.5,
  minGap: 1,
  value: [19, 23],
  showValue: true,
  format: (v) => `${v.toFixed(1)}°`,
  labels: { low: 'Heat below', high: 'Cool above' },
  onChange: ([low, high]) => (status.textContent = `Heating below ${low}°, cooling above ${high}°`),
});

document.body.append(comfort.el, status);
