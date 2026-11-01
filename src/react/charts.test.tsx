import { act, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  createBarChart,
  createCurvesEditor,
  createHistogram,
  createLevelMeter,
  createMeter,
  createMonthGrid,
  createWaveform,
  type CurvePoint,
} from '../web/charts/index.ts';
import { BarChart, CurvesEditor, Histogram, LevelMeter, Meter, MonthGrid, Waveform } from './charts.tsx';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const KEPT = new Set(['class', 'role', 'tabindex', 'd', 'x', 'y', 'width', 'height', 'viewBox', 'preserveAspectRatio', 'vector-effect', 'scope', 'abbr', 'data-index', 'style']);

/** Tag, the attributes that matter (style without spaces), ARIA and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => KEPT.has(a.name) || a.name.startsWith('aria-'))
      .map((a) => `${a.name}=${a.name === 'style' ? a.value.replace(/\s+/g, '').replace(/;$/, '') : a.value}`)
      .sort();
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    out.push(`${el.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim());
    Array.from(el.children).forEach(walk);
  };
  walk(root);
  return out;
}

function react(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

const WEEK = [
  { label: 'Mon', name: 'Monday', value: 4.2 },
  { label: 'Tue', name: 'Tuesday', value: -1.5, color: 3 as const },
  { label: 'Wed', name: 'Wednesday', value: null },
];

describe('charts parity', () => {
  it('BarChart', () => {
    const o = { bars: WEEK, label: 'Energy', color: 2 as const, showValues: true, highlight: 0, format: (v: number) => `${v} kWh` };
    expect(shape(react(<BarChart {...o} />))).toEqual(shape(createBarChart(o).el));
    expect(shape(react(<BarChart bars={WEEK} label="Energy" axis={false} size="small" />))).toEqual(shape(createBarChart({ bars: WEEK, label: 'Energy', axis: false, size: 'small' }).el));
    expect(react(<BarChart bars={WEEK} label="Energy" className="extra" />).className).toBe('mh-bar-chart mh-bar-chart--accent extra');
  });

  it('MonthGrid', () => {
    const o = { year: 2026, month: 5, values: Array.from({ length: 31 }, (_, i) => (i % 5 ? i : null)), label: 'Rain', locale: 'en-GB', today: 9, steps: 5, color: 4 as const };
    expect(shape(react(<MonthGrid {...o} />))).toEqual(shape(createMonthGrid(o).el));
    expect(shape(react(<MonthGrid {...o} weekStart={0} legend={false} caption="This month" />))).toEqual(shape(createMonthGrid({ ...o, weekStart: 0, legend: false, caption: 'This month' }).el));
  });

  it('Meter', () => {
    const o = { value: 72, label: 'Load', zones: { warning: 60, danger: 85 }, segments: 12 };
    expect(shape(react(<Meter {...o} />))).toEqual(shape(createMeter(o).el));
    const bars = { value: 2, max: 4, label: 'Signal', mode: 'bars' as const, valueText: '2 of 4 bars', color: 1 as const };
    expect(shape(react(<Meter {...bars} />))).toEqual(shape(createMeter(bars).el));
  });

  it('LevelMeter', () => {
    const o = { levels: [-6, -18], peaks: [-2, -10], channels: ['L', 'R'], label: 'Output', scale: true, segmented: true };
    expect(shape(react(<LevelMeter {...o} />))).toEqual(shape(createLevelMeter(o).el));
    const v = { levels: [-24], label: 'Mic', orientation: 'vertical' as const, peaks: [0] };
    expect(shape(react(<LevelMeter {...v} />))).toEqual(shape(createLevelMeter(v).el));
  });

  it('Waveform', () => {
    const peaks = [0.1, 0.6, 1, 0.4, 0.2];
    for (const style of ['bars', 'half', 'envelope', 'line', 'dots'] as const) {
      expect(shape(react(<Waveform peaks={peaks} label="Chime" style={style} />))).toEqual(shape(createWaveform({ peaks, label: 'Chime', style }).el));
    }
    const o = { peaks, label: 'Voice message', duration: 42, position: 12, selection: { start: 5, end: 9 }, onSeek: () => {} };
    expect(shape(react(<Waveform {...o} />))).toEqual(shape(createWaveform(o).el));
  });

  it('Histogram', () => {
    const o = { data: { luminance: [9, 3, 5, 2, 4], red: [1, 2, 3, 4, 5] }, label: 'Snapshot', scale: 'sqrt' as const };
    expect(shape(react(<Histogram {...o} />))).toEqual(shape(createHistogram(o).el));
  });

  it('CurvesEditor', () => {
    const o = { points: [{ x: 0, y: 0.1 }, { x: 0.4, y: 0.6 }, { x: 1, y: 0.9 }], label: 'Tone curve', histogram: [1, 3, 2], channel: 'blue' as const };
    expect(shape(react(<CurvesEditor {...o} />))).toEqual(shape(createCurvesEditor(o).el));
  });
});

describe('charts behaviour', () => {
  it('Waveform reports seeks from the keyboard', () => {
    const onSeek = vi.fn();
    const host = document.createElement('div');
    const root = createRoot(host);
    act(() => root.render(<Waveform peaks={[0.5, 1]} label="Voice message" duration={60} position={10} onSeek={onSeek} />));
    const el = host.querySelector<HTMLElement>('.mh-waveform')!;
    act(() => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    });
    expect(onSeek).toHaveBeenCalledWith(60);
    act(() => root.unmount());
  });

  it('CurvesEditor is controlled and keeps focus on the edited point', () => {
    const seen: CurvePoint[][] = [];
    function Host() {
      const [points, setPoints] = useState<CurvePoint[]>([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]);
      return (
        <CurvesEditor
          points={points}
          label="Tone curve"
          onChange={(p) => {
            seen.push(p);
            setPoints(p);
          }}
        />
      );
    }
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    act(() => root.render(<Host />));
    act(() => {
      host.querySelector('.mh-curves__point')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Insert', bubbles: true }));
    });
    const points = host.querySelectorAll<HTMLElement>('.mh-curves__point');
    expect(points).toHaveLength(3);
    expect(document.activeElement).toBe(points[1]);
    act(() => {
      points[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));
    });
    expect(seen[seen.length - 1]![1]).toEqual({ x: 0.5, y: 0.4 });
    expect(points[1]!.getAttribute('aria-valuetext')).toBe('Input 128, output 102');
    act(() => root.unmount());
    host.remove();
  });
});
