import { createLevelMeter } from '@mosaic-home/design-system/web';

const meter = createLevelMeter({
  levels: [-Infinity, -Infinity],
  channels: ['L', 'R'],
  label: 'Speaker output',
  scale: true,
});

// Feed it levels in dBFS, for example from an audio analyser; peaks are held and fall back on their own.
const tick = (now: number): void => {
  const base = -18 + 8 * Math.sin(now / 900);
  meter.setLevels([Math.min(0, base + Math.random() * 8), Math.min(0, base - 3 + Math.random() * 8)], now);
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);

document.body.append(meter.el);
