import { createTrend, type TrendOptions } from '@mosaic-home/design-system/web';

const values = [19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.4, 21.9, 21.5];

const options = (latest: number): TrendOptions => ({
  name: 'Living room',
  value: latest,
  unit: '°C',
  values,
  format: (v) => v.toFixed(1),
});

const trend = createTrend(options(21.5));

// Each new reading joins the chart and becomes the value shown.
setInterval(() => {
  const latest = Math.round((20 + Math.random() * 2) * 10) / 10;
  values.push(latest);
  values.shift();
  trend.update(options(latest));
}, 5000);

document.body.append(trend.el);
