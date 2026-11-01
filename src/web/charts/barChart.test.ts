import { describe, expect, it } from 'vitest';
import { barChartScale, barChartSummary, createBarChart } from './index.ts';

const WEEK = [
  { label: 'Mon', name: 'Monday', value: 4.2 },
  { label: 'Tue', name: 'Tuesday', value: 6.1 },
  { label: 'Wed', name: 'Wednesday', value: null },
  { label: 'Thu', name: 'Thursday', value: 3 },
];

describe('bar chart', () => {
  it('summarises every column, or the extremes of long series', () => {
    expect(barChartSummary('Energy', WEEK, (v) => `${v} kWh`)).toBe('Energy: Monday 4.2 kWh, Tuesday 6.1 kWh, Wednesday no data, Thursday 3 kWh');
    const day = Array.from({ length: 24 }, (_, i) => ({ label: String(i), value: i === 5 ? 9 : i + 10 }));
    expect(barChartSummary('Power', day)).toBe('Power: 24 columns, low 9 (5), high 33 (23), latest 33 (23)');
    expect(barChartSummary('Power', [{ label: 'a', value: null }])).toBe('Power: no data');
  });

  it('uses a round scale that includes zero', () => {
    expect(barChartScale(WEEK)).toMatchObject({ min: 0, max: 8, ticks: [0, 2, 4, 6, 8] });
    expect(barChartScale([{ label: 'a', value: -3 }, { label: 'b', value: 7 }])).toMatchObject({ min: -5, max: 7.5 });
    expect(barChartScale(WEEK, 0, 10)).toMatchObject({ min: 0, max: 10, ticks: [0, 2.5, 5, 7.5, 10] });
  });

  it('draws columns, labels, values and a highlight', () => {
    const c = createBarChart({ bars: WEEK, label: 'Energy', color: 2, showValues: true, highlight: 1 });
    expect(c.el.className).toBe('mh-bar-chart mh-bar-chart--series-2 mh-bar-chart--highlight mh-bar-chart--values');
    expect(c.el.getAttribute('role')).toBe('img');
    const bars = c.el.querySelectorAll('.mh-bar-chart__bar');
    expect(bars).toHaveLength(3);
    expect(bars[0]!.getAttribute('y')).toBe('47.5');
    expect(bars[0]!.getAttribute('height')).toBe('52.5');
    expect(bars[1]!.classList.contains('is-highlight')).toBe(true);
    expect([...c.el.querySelectorAll('.mh-bar-chart__tick')].map((t) => t.textContent)).toEqual(['0', '2', '4', '6', '8']);
    expect([...c.el.querySelectorAll('.mh-bar-chart__label')].map((t) => t.className)).toEqual([
      'mh-bar-chart__label',
      'mh-bar-chart__label is-highlight',
      'mh-bar-chart__label is-empty',
      'mh-bar-chart__label',
    ]);
    expect(c.el.querySelector('.mh-bar-chart__value')!.getAttribute('style')).toBe('left: 12.5%; bottom: 52.5%');
    const first = c.el.querySelector('.mh-bar-chart__bar');
    c.update({ bars: WEEK.map((b) => ({ ...b, value: 1 })), label: 'Energy', color: 2 });
    expect(c.el.querySelectorAll('.mh-bar-chart__bar')).toHaveLength(4);
    expect(c.el.querySelector('.mh-bar-chart__bar')).toBe(first);
    c.update({ bars: WEEK, label: 'Energy', axis: false });
    expect(c.el.className).toBe('mh-bar-chart mh-bar-chart--accent mh-bar-chart--no-axis');
    expect(c.el.querySelector('.mh-bar-chart__axis')).toBeNull();
    expect(c.el.querySelector('.mh-bar-chart__grid')).toBeNull();
  });

  it('hangs negative values below zero and thins long label rows', () => {
    const c = createBarChart({ bars: Array.from({ length: 24 }, (_, i) => ({ label: String(i), value: i % 2 ? -2 : 4 })), label: 'Net' });
    const neg = c.el.querySelectorAll('.mh-bar-chart__bar')[1]!;
    expect(Number(neg.getAttribute('y'))).toBeCloseTo(Number(c.el.querySelector('.mh-bar-chart__zero')!.getAttribute('d')!.split(' ')[1]!.replace('H100', '')));
    expect(c.el.querySelectorAll('.mh-bar-chart__label:not(.is-hidden)')).toHaveLength(8);
  });
});
