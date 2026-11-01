import { createMeter } from '@mosaic-home/design-system/web';

let level = 64;

const noise = createMeter({
  value: level,
  label: 'Noise level',
  zones: { warning: 70, danger: 90 },
  segments: 12,
  valueText: `${level} dB`,
});

const signal = createMeter({ value: 3, max: 4, mode: 'bars', label: 'Wi-Fi signal', valueText: '3 of 4' });

setInterval(() => {
  level = Math.max(30, Math.min(100, level + Math.round((Math.random() - 0.5) * 16)));
  noise.setValue(level, `${level} dB`);
}, 500);

document.body.append(noise.el, signal.el);
