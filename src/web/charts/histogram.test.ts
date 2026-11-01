import { describe, expect, it, vi } from 'vitest';
import {
  createCurvesEditor,
  createHistogram,
  curveAdd,
  curveLut,
  curveMove,
  curveRemove,
  curveSample,
  curvesKey,
  histogramChannels,
  histogramFromPixels,
  histogramPaths,
  histogramStats,
  histogramSummary,
} from './index.ts';

describe('histogram', () => {
  it('bins pixels per channel', () => {
    const h = histogramFromPixels([255, 0, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255], 4);
    expect(h.red).toEqual([1, 0, 0, 2]);
    expect(h.blue).toEqual([1, 0, 0, 2]);
    expect(h.luminance).toEqual([2, 0, 0, 1]);
  });

  it('draws the chosen channels on one scale', () => {
    const data = { luminance: [0, 2, 4], red: [1, 1, 1] };
    expect(histogramChannels(data)).toEqual(['luminance', 'red']);
    expect(histogramChannels(data, 'rgb')).toEqual(['red']);
    expect(histogramPaths(data, ['luminance', 'red'])).toEqual({ luminance: 'M0 100L0 100L50 50L100 0L100 100Z', red: 'M0 100L0 75L50 75L100 75L100 100Z' });
    expect(histogramPaths({ luminance: [0, 100] }, ['luminance'], 'sqrt').luminance).toBe('M0 100L0 100L100 0L100 100Z');
  });

  it('describes the tones', () => {
    expect(histogramStats([1, 0, 0, 1])).toEqual({ mean: 0.5, shadows: 0.5, highlights: 0.5 });
    expect(histogramSummary('Snapshot', { luminance: [0, 2, 5, 2, 1] })).toBe('Snapshot: mostly midtones, mean level 55%, 10% clipped highlights');
    expect(histogramSummary('Snapshot', { red: [8, 2, 0], green: [8, 2, 0] })).toBe('Snapshot: mostly shadows, mean level 10%, 80% clipped shadows');
    expect(histogramSummary('Snapshot', {})).toBe('Snapshot: no data');
  });

  it('renders areas and clipping markers', () => {
    const h = createHistogram({ data: { luminance: [5, 1, 1, 0], red: [1, 2, 3, 4] }, label: 'Snapshot', size: 'large' });
    expect(h.el.className).toBe('mh-histogram mh-histogram--lg');
    expect(h.el.getAttribute('role')).toBe('img');
    expect([...h.el.querySelectorAll('.mh-histogram__channel')].map((p) => p.getAttribute('class'))).toEqual([
      'mh-histogram__channel mh-histogram__channel--luminance',
      'mh-histogram__channel mh-histogram__channel--red',
    ]);
    expect(h.el.querySelector('.mh-histogram__clip--shadows')).not.toBeNull();
    expect(h.el.querySelector('.mh-histogram__clip--highlights')).toBeNull();
    h.update({ data: { luminance: [5, 1, 1, 0] }, label: 'Snapshot', clipping: false });
    expect(h.el.querySelectorAll('.mh-histogram__channel')).toHaveLength(1);
    expect(h.el.querySelector('.mh-histogram__clip')).toBeNull();
  });
});

const LINEAR = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

describe('tone curve maths', () => {
  it('interpolates through the points without overshoot', () => {
    expect(curveSample(LINEAR, 0.25)).toBeCloseTo(0.25);
    const s = [{ x: 0, y: 0 }, { x: 0.5, y: 0.8 }, { x: 1, y: 1 }];
    expect(curveSample(s, 0.5)).toBeCloseTo(0.8);
    const lut = curveLut(s, 101);
    for (let i = 1; i < lut.length; i += 1) expect(lut[i]!).toBeGreaterThanOrEqual(lut[i - 1]!);
    expect(Math.max(...lut)).toBeLessThanOrEqual(1);
    const flat = [{ x: 0.2, y: 0.1 }, { x: 0.8, y: 0.9 }];
    expect(curveSample(flat, 0)).toBe(0.1);
    expect(curveSample(flat, 1)).toBe(0.9);
    expect(curveLut(LINEAR, 3)).toEqual([0, 0.5, 1]);
  });

  it('moves, adds and removes points', () => {
    const pts = [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }];
    expect(curveMove(pts, 1, 2, -1)).toEqual([{ x: 0, y: 0 }, { x: 0.99, y: 0 }, { x: 1, y: 1 }]);
    expect(curveMove(pts, 0, 0.7, 0.2)[0]).toEqual({ x: 0.49, y: 0.2 });
    expect(curveAdd(pts, 0.25)).toEqual({ points: [{ x: 0, y: 0 }, { x: 0.25, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }], index: 1 });
    expect(curveAdd(pts, 0.51)).toBeNull();
    expect(curveAdd(pts, 0.25, 3)).toBeNull();
    expect(curveRemove(pts, 1)).toEqual([{ x: 0, y: 0 }, { x: 1, y: 1 }]);
    expect(curveRemove(pts, 0)).toBeNull();
    expect(curvesKey(pts, 1, 'ArrowUp', true, 0.01)).toEqual({ points: [{ x: 0, y: 0 }, { x: 0.5, y: 0.6 }, { x: 1, y: 1 }], focus: 1 });
    expect(curvesKey(pts, 1, 'Delete', false)?.focus).toBe(0);
    expect(curvesKey(pts, 0, 'Insert', false)).toEqual({ points: [{ x: 0, y: 0 }, { x: 0.25, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }], focus: 1 });
    expect(curvesKey(pts, 1, 'a', false)).toBeNull();
  });
});

describe('curves editor', () => {
  it('renders points as sliders and edits them from the keyboard', () => {
    const onChange = vi.fn();
    const c = createCurvesEditor({ points: [{ x: 1, y: 1 }, { x: 0, y: 0 }], label: 'Tone curve', histogram: [1, 4, 2], channel: 'red', onChange });
    document.body.append(c.el);
    expect(c.el.className).toBe('mh-curves mh-curves--red');
    expect(c.el.getAttribute('role')).toBe('group');
    expect(c.el.querySelector('.mh-curves__histogram')).not.toBeNull();
    const points = c.el.querySelectorAll<HTMLElement>('.mh-curves__point');
    expect(points).toHaveLength(2);
    expect(points[0]!.getAttribute('aria-valuetext')).toBe('Input 0, output 0');
    expect(points[1]!.getAttribute('style')).toBe('left: 100%; top: 0%');
    points[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Insert', bubbles: true }));
    expect(onChange).toHaveBeenLastCalledWith([{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }]);
    const mid = c.el.querySelectorAll<HTMLElement>('.mh-curves__point')[1]!;
    expect(document.activeElement).toBe(mid);
    mid.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
    expect(c.getPoints()[1]).toEqual({ x: 0.5, y: 0.6 });
    expect(mid.getAttribute('aria-valuetext')).toBe('Input 128, output 153');
    expect(document.activeElement).toBe(mid);
    mid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    expect(c.getPoints()).toHaveLength(2);
    expect(document.activeElement).toBe(c.el.querySelectorAll('.mh-curves__point')[0]);
    c.update({ points: LINEAR, label: 'Tone curve', disabled: true });
    expect(c.el.className).toBe('mh-curves mh-curves--luminance is-disabled');
    expect(c.el.querySelector('.mh-curves__point')!.getAttribute('tabindex')).toBe('-1');
    c.destroy();
    c.el.remove();
  });
});
