import { createSparkline } from '@mosaic-home/design-system/web';

const readings = [19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.4, 21.9, 22.3];

const sparkline = createSparkline({
  values: readings,
  label: 'Living room temperature, last 12 hours',
  area: true,
  format: (v) => `${v.toFixed(1)}°`,
});

// A new reading arrives: drop the oldest and redraw.
setInterval(() => {
  const last = readings[readings.length - 1] ?? 21;
  readings.push(Math.round((last + (Math.random() - 0.5)) * 10) / 10);
  readings.shift();
  sparkline.setValues(readings);
}, 2000);

document.body.append(sparkline.el);
