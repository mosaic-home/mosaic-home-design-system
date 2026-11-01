// charts group: React bindings. Same DOM and classes as the web renderer.
import { createElement, useEffect, useRef, type CSSProperties, type ReactElement, type Ref } from 'react';
import { barChartTree, type BarChartOptions } from '../web/charts/barChart.ts';
import { attachCurves, curvesTree, type CurvePoint, type CurvesEditorOptions } from '../web/charts/curvesEditor.ts';
import { histogramTree, type HistogramOptions } from '../web/charts/histogram.ts';
import { holdPeak, levelMeterTree, type LevelMeterOptions, type PeakHold } from '../web/charts/levelMeter.ts';
import { meterTree, type MeterOptions } from '../web/charts/meter.ts';
import { monthGridTree, type MonthGridOptions } from '../web/charts/monthGrid.ts';
import type { ChartNode } from '../web/charts/tree.ts';
import { attachWaveform, waveformTree, type WaveformOptions } from '../web/charts/waveform.ts';
import { sparklineClass, sparklineGeometry, sparklineSummary, type SparklineColor, type SparklineSize, type SparklineValues } from '../web/charts/sparkline.ts';
import { trendRangeText, trendValueText, trendWithUnit } from '../web/charts/trend.ts';
import { cx } from '../web/dom.ts';

export interface SparklineProps {
  values: SparklineValues;
  label: string;
  color?: SparklineColor;
  area?: boolean;
  min?: number;
  max?: number;
  dot?: boolean;
  size?: SparklineSize;
  format?: (value: number) => string;
  className?: string;
}

/** Same DOM and classes as `createSparkline`. */
export function Sparkline({ values, label, color, area, min, max, dot = true, size, format, className }: SparklineProps) {
  const g = sparklineGeometry(values, min, max);
  return (
    <div className={cx(sparklineClass(color, size, area), className)} role="img" aria-label={sparklineSummary(label, values, format)}>
      <svg className="mh-sparkline__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {area && <path className="mh-sparkline__area" d={g.area} />}
        <path className="mh-sparkline__line" d={g.line} vectorEffect="non-scaling-stroke" />
      </svg>
      {g.last && dot && <span className="mh-sparkline__dot" aria-hidden="true" style={{ left: `${g.last.x}%`, top: `${g.last.y}%` }} />}
    </div>
  );
}

export interface TrendProps {
  name: string;
  /** The latest reading; `null` shows a dash. */
  value: number | null;
  unit?: string;
  values: SparklineValues;
  /** The line under the value; default: low–high of `values` with the unit. */
  range?: string;
  color?: SparklineColor;
  format?: (value: number) => string;
  className?: string;
}

/** Same DOM and classes as `createTrend`. */
export function Trend({ name, value, unit, values, range, color, format, className }: TrendProps) {
  const fmt = format ?? String;
  const rangeText = trendRangeText({ range, values, unit, format });
  return (
    <div className={cx('mh-trend', className)}>
      <div className="mh-trend__text">
        <span className="mh-trend__name">{name}</span>
        <span className="mh-trend__reading">
          <span className="mh-trend__value">{trendValueText(value, format)}</span>
          {unit && <span className="mh-trend__unit">{unit}</span>}
        </span>
        {rangeText && <span className="mh-trend__range">{rangeText}</span>}
      </div>
      <div className="mh-trend__chart">
        <Sparkline values={values} label={name} color={color} area size="large" format={(v) => trendWithUnit(fmt(v), unit)} />
      </div>
    </div>
  );
}

// Chart trees ------------------------------------------------------------------------------------------------------
// The newer charts describe their markup once as a tree (src/web/charts/tree.ts); these turn it into React elements.

const ATTR_NAMES: Record<string, string> = { class: 'className', tabindex: 'tabIndex', 'vector-effect': 'vectorEffect', colspan: 'colSpan', rowspan: 'rowSpan' };

function styleObject(style: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of style.split(';')) {
    const at = decl.indexOf(':');
    if (at < 0) continue;
    const prop = decl.slice(0, at).trim();
    const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = decl.slice(at + 1).trim();
  }
  return out as CSSProperties;
}

/** React elements for a chart tree; `root` props (ref, className) are merged into the outer element. */
function fromTree(n: ChartNode, key?: number, root?: { className?: string; ref?: Ref<HTMLDivElement> }): ReactElement {
  const props: Record<string, unknown> = { key };
  for (const [k, v] of Object.entries(n.attrs)) {
    if (k === 'style') props['style'] = styleObject(v);
    else props[ATTR_NAMES[k] ?? k] = v;
  }
  if (root) {
    props['className'] = cx(n.attrs['class'], root.className) || undefined;
    if (root.ref) props['ref'] = root.ref;
  }
  return createElement(n.tag, props, ...n.children.map((c, i) => (typeof c === 'string' ? c : fromTree(c, i))));
}

export interface BarChartProps extends BarChartOptions {
  className?: string;
}

/** Same DOM and classes as `createBarChart`. */
export function BarChart({ className, ...options }: BarChartProps) {
  return fromTree(barChartTree(options), undefined, { className });
}

export interface MonthGridProps extends MonthGridOptions {
  className?: string;
}

/** Same DOM and classes as `createMonthGrid`. */
export function MonthGrid({ className, ...options }: MonthGridProps) {
  return fromTree(monthGridTree(options), undefined, { className });
}

export interface MeterProps extends MeterOptions {
  className?: string;
}

/** Same DOM and classes as `createMeter`. */
export function Meter({ className, ...options }: MeterProps) {
  return fromTree(meterTree(options), undefined, { className });
}

export interface LevelMeterProps extends LevelMeterOptions {
  className?: string;
}

/**
 * Same DOM and classes as `createLevelMeter`. Without `peaks` it holds the peaks itself from the levels it is
 * rendered with (re-render with new levels, for example once per animation frame).
 */
export function LevelMeter({ className, ...options }: LevelMeterProps) {
  const holds = useRef<(PeakHold | undefined)[]>([]);
  let peaks = options.peaks;
  if (!peaks) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const prev = holds.current;
    const next: (PeakHold | undefined)[] = [];
    peaks = options.levels.map((l, i) => {
      const { state, shown } = holdPeak(prev[i], Number.isFinite(l) ? l : -Infinity, now, options.peakHold, options.peakDecay);
      next[i] = state;
      return shown;
    });
    holds.current = next;
  }
  return fromTree(levelMeterTree(options, peaks), undefined, { className });
}

export interface WaveformProps extends WaveformOptions {
  className?: string;
}

/**
 * Same DOM and classes as `createWaveform`. Controlled: `position` and `selection` come from props; seeking and
 * selecting call `onSeek` and `onSelect`.
 */
export function Waveform({ className, ...options }: WaveformProps) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachWaveform(
      el,
      () => latest.current,
      (t) => latest.current.onSeek?.(t),
      (s) => latest.current.onSelect?.(s),
    );
  }, []);
  return fromTree(waveformTree(options), undefined, { className, ref });
}

export interface CurvesEditorProps extends CurvesEditorOptions {
  className?: string;
}

/**
 * Same DOM and classes as `createCurvesEditor`. Controlled: render the points from `onChange` back into `points`.
 * Focus follows the point a key press or a double-click left selected.
 */
export function CurvesEditor({ className, ...options }: CurvesEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(options);
  const focus = useRef<number | undefined>(undefined);
  useEffect(() => {
    latest.current = options;
    const el = ref.current;
    if (el && focus.current !== undefined) el.querySelector<HTMLElement>(`[data-index="${focus.current}"]`)?.focus();
    focus.current = undefined;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return attachCurves(
      el,
      () => latest.current,
      (points: CurvePoint[], at?: number) => {
        focus.current = at;
        latest.current = { ...latest.current, points };
        latest.current.onChange?.(points);
      },
    );
  }, []);
  return fromTree(curvesTree(options), undefined, { className, ref });
}

export interface HistogramProps extends HistogramOptions {
  className?: string;
}

/** Same DOM and classes as `createHistogram`. */
export function Histogram({ className, ...options }: HistogramProps) {
  return fromTree(histogramTree(options), undefined, { className });
}
