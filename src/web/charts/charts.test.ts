import { describe, expect, it } from 'vitest';
import { createSparkline, sparklineGeometry, sparklineSummary } from './index.ts';

describe('sparkline geometry', () => {
  it('scales values into a 100 x 100 box', () => {
    const g = sparklineGeometry([0, 5, 10]);
    expect(g.line).toBe('M0 100L50 50L100 0');
    expect(g.area).toBe('M0 100L0 100L50 50L100 0L100 100Z');
    expect(g.last).toEqual({ x: 100, y: 0 });
  });

  it('breaks the line at gaps and uses a fixed scale', () => {
    const g = sparklineGeometry([50, null, 25, 75], 0, 100);
    expect(g.line).toBe('M0 50h0M66.67 75L100 25');
    expect(g.area).toBe('M66.67 100L66.67 75L100 25L100 100Z');
  });

  it('handles flat, empty and trailing-gap data', () => {
    expect(sparklineGeometry([3, 3]).line).toBe('M0 50L100 50');
    expect(sparklineGeometry([]).last).toBeNull();
    expect(sparklineGeometry([1, 2, null]).last).toBeNull();
  });
});

describe('sparkline', () => {
  it('summarises the data for screen readers and colours by series', () => {
    expect(sparklineSummary('Power', [1, null, 3, 2])).toBe('Power: latest 2, low 1, high 3');
    const s = createSparkline({ values: [1, 2, 3], label: 'Battery', color: 3, area: true, format: (v) => `${v}%` });
    expect(s.el.className).toBe('mh-sparkline mh-sparkline--series-3 mh-sparkline--area');
    expect(s.el.getAttribute('role')).toBe('img');
    expect(s.el.getAttribute('aria-label')).toBe('Battery: latest 3%, low 1%, high 3%');
    expect(s.el.querySelector('.mh-sparkline__area')).not.toBeNull();
    expect(s.el.querySelector<HTMLElement>('.mh-sparkline__dot')!.style.left).toBe('100%');
    s.setValues([1, null]);
    expect(s.el.querySelector('.mh-sparkline__dot')).toBeNull();
  });
});
