import { describe, expect, it } from 'vitest';
import { createTrend, trendRange, trendValueText } from './index.ts';

describe('trend', () => {
  it('computes the range and value text', () => {
    expect(trendRange([19.5, null, 21.3, 20], '°C')).toBe('19.5–21.3 °C');
    expect(trendRange([3, 3], 'W')).toBe('3 W');
    expect(trendRange([null], 'W')).toBe('');
    expect(trendRange([1, 2], undefined, (v) => v.toFixed(1))).toBe('1.0–2.0');
    expect(trendValueText(null)).toBe('—');
    expect(trendValueText(21.25, (v) => v.toFixed(1))).toBe('21.3');
  });

  it('renders the reading, range and a sparkline with an area', () => {
    const t = createTrend({ name: 'Living room', value: 21.3, unit: '°C', values: [19.5, 20, 21.3], color: 2 });
    expect(t.el.className).toBe('mh-trend');
    expect(t.el.querySelector('.mh-trend__name')!.textContent).toBe('Living room');
    expect(t.el.querySelector('.mh-trend__value')!.textContent).toBe('21.3');
    expect(t.el.querySelector('.mh-trend__unit')!.textContent).toBe('°C');
    expect(t.el.querySelector('.mh-trend__range')!.textContent).toBe('19.5–21.3 °C');
    const spark = t.el.querySelector('.mh-trend__chart > .mh-sparkline')!;
    expect(spark.className).toBe('mh-sparkline mh-sparkline--series-2 mh-sparkline--lg mh-sparkline--area');
    expect(spark.getAttribute('aria-label')).toBe('Living room: latest 21.3 °C, low 19.5 °C, high 21.3 °C');
  });

  it('uses a given range and updates', () => {
    const t = createTrend({ name: 'Power', value: null, values: [], range: 'No readings yet' });
    expect(t.el.querySelector('.mh-trend__value')!.textContent).toBe('—');
    expect(t.el.querySelector('.mh-trend__unit')).toBeNull();
    expect(t.el.querySelector('.mh-trend__range')!.textContent).toBe('No readings yet');
    t.update({ name: 'Power', value: 120, unit: 'W', values: [] });
    expect(t.el.querySelector('.mh-trend__value')!.textContent).toBe('120');
    expect(t.el.querySelector('.mh-trend__unit')!.textContent).toBe('W');
    expect(t.el.querySelector('.mh-trend__range')).toBeNull();
    expect(t.el.querySelectorAll('.mh-sparkline')).toHaveLength(1);
  });
});
