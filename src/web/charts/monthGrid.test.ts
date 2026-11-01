import { describe, expect, it } from 'vitest';
import { createMonthGrid, heatLevel, monthGridLegendText, monthWeeks } from './index.ts';

describe('month heat grid', () => {
  it('lays out the weeks', () => {
    // 1 March 2026 is a Sunday.
    const weeks = monthWeeks(2026, 3, 1);
    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(weeks[5]).toEqual([30, 31, null, null, null, null, null]);
    expect(monthWeeks(2026, 3, 0)[0]![0]).toBe(1);
    expect(monthWeeks(2024, 2, 1).flat().filter(Boolean)).toHaveLength(29);
  });

  it('maps values to colour steps', () => {
    expect(heatLevel(null, 0, 10)).toBe(0);
    expect(heatLevel(0, 0, 10)).toBe(1);
    expect(heatLevel(4.9, 0, 10)).toBe(2);
    expect(heatLevel(10, 0, 10)).toBe(4);
    expect(heatLevel(20, 0, 10)).toBe(4);
    expect(heatLevel(5, 5, 5)).toBe(2);
    expect(monthGridLegendText(0, 8, 4)).toBe('Colour scale from lightest to darkest: 0 to 2, 2 to 4, 4 to 6, 6 to 8');
  });

  it('renders an accessible table with a legend', () => {
    const values = Array.from({ length: 31 }, (_, i) => (i === 3 ? null : i % 8));
    const g = createMonthGrid({ year: 2026, month: 3, values, label: 'Energy', locale: 'en-GB', today: 12, format: (v) => `${v} kWh`, color: 3 });
    expect(g.el.className).toBe('mh-month-grid mh-month-grid--series-3');
    const table = g.el.querySelector('table')!;
    expect(table.getAttribute('aria-label')).toBe('Energy, March 2026');
    expect(table.querySelector('caption')!.textContent).toBe('March 2026');
    expect([...table.querySelectorAll('th')].map((th) => th.getAttribute('abbr'))).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    const days = table.querySelectorAll('.mh-month-grid__day');
    expect(days).toHaveLength(31);
    expect(days[3]!.className).toBe('mh-month-grid__day is-empty');
    expect(days[3]!.querySelector('.mh-visually-hidden')!.textContent).toBe('4 March: no data');
    expect(days[7]!.getAttribute('style')).toBe('--_t: 1');
    expect(days[7]!.classList.contains('is-strong')).toBe(true);
    expect(days[11]!.querySelector('.mh-visually-hidden')!.textContent).toBe('12 March: 3 kWh, today');
    expect(days[11]!.classList.contains('is-today')).toBe(true);
    expect(table.querySelectorAll('.mh-month-grid__pad')).toHaveLength(11);
    const legend = g.el.querySelector('.mh-month-grid__legend')!;
    expect(legend.getAttribute('role')).toBe('img');
    expect(legend.querySelectorAll('.mh-month-grid__swatch')).toHaveLength(4);
    expect([...legend.querySelectorAll('.mh-month-grid__end')].map((e) => e.textContent)).toEqual(['0 kWh', '7 kWh']);
    g.update({ year: 2026, month: 2, values: [], label: 'Energy', locale: 'en-GB', legend: false });
    expect(g.el.querySelectorAll('.mh-month-grid__day')).toHaveLength(28);
    expect(g.el.querySelector('.mh-month-grid__legend')).toBeNull();
  });
});
