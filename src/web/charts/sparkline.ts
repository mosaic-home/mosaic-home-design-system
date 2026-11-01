import { cx, h } from '../dom.ts';

/** A series colour (`--mh-series-1` .. `--mh-series-6`) or the theme accent. */
export type SparklineColor = 1 | 2 | 3 | 4 | 5 | 6 | 'accent';
export type SparklineSize = 'small' | 'medium' | 'large';
/** One reading per step; `null` is a gap (no data). */
export type SparklineValues = readonly (number | null)[];

export interface SparklineOptions {
  values: SparklineValues;
  /** What it shows ("Temperature, last 24 hours"); the summary of the values is added for screen readers. */
  label: string;
  color?: SparklineColor;
  /** Fill under the line. */
  area?: boolean;
  /** Fixed bottom and top of the scale; default: the data's own range. */
  min?: number;
  max?: number;
  /** A dot on the last value (default true). */
  dot?: boolean;
  size?: SparklineSize;
  /** Formats values in the accessible summary. */
  format?: (value: number) => string;
}

export interface SparklineHandle {
  el: HTMLDivElement;
  setValues(values: SparklineValues): void;
}

export interface SparklineGeometry {
  /** Path of the line in a 100 x 100 box (y down); separate sub-paths around gaps. */
  line: string;
  /** Closed path of the area under the line, or '' when there is no run of two points. */
  area: string;
  /** Position of the last value in percent of the box, or null when there is none. */
  last: { x: number; y: number } | null;
}

const r = (n: number): number => Math.round(n * 100) / 100;

/** Pure geometry for a sparkline: SVG paths in a 100 x 100 box, drawn with `preserveAspectRatio="none"`. */
export function sparklineGeometry(values: SparklineValues, min?: number, max?: number): SparklineGeometry {
  const nums = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (nums.length === 0) return { line: '', area: '', last: null };
  const lo = min ?? Math.min(...nums);
  const hi = max ?? Math.max(...nums);
  const n = values.length;
  const x = (i: number): number => (n === 1 ? 50 : r((i / (n - 1)) * 100));
  const y = (v: number): number => (hi === lo ? 50 : r(100 - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * 100));
  const runs: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];
  values.forEach((v, i) => {
    if (v === null || !Number.isFinite(v)) {
      if (run.length) runs.push(run);
      run = [];
    } else run.push({ x: x(i), y: y(v) });
  });
  if (run.length) runs.push(run);
  const line = runs.map((pts) => (pts.length === 1 ? `M${pts[0]!.x} ${pts[0]!.y}h0` : pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(''))).join('');
  const area = runs
    .filter((pts) => pts.length > 1)
    .map((pts) => `M${pts[0]!.x} 100${pts.map((p) => `L${p.x} ${p.y}`).join('')}L${pts[pts.length - 1]!.x} 100Z`)
    .join('');
  const lastRun = runs[runs.length - 1]!;
  const lastPoint = lastRun[lastRun.length - 1]!;
  // The last dot only marks the newest reading; a trailing gap means there is none.
  const tail = values[n - 1];
  return { line, area, last: tail === null || tail === undefined || !Number.isFinite(tail) ? null : lastPoint };
}

/** The accessible text: label, latest, low and high. */
export function sparklineSummary(label: string, values: SparklineValues, format: (value: number) => string = String): string {
  const nums = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (nums.length === 0) return `${label}: no data`;
  return `${label}: latest ${format(nums[nums.length - 1]!)}, low ${format(Math.min(...nums))}, high ${format(Math.max(...nums))}`;
}

export function sparklineClass(color: SparklineColor = 'accent', size: SparklineSize = 'medium', area = false): string {
  return cx('mh-sparkline', `mh-sparkline--${color === 'accent' ? 'accent' : `series-${color}`}`, size !== 'medium' && `mh-sparkline--${size === 'small' ? 'sm' : 'lg'}`, area && 'mh-sparkline--area');
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/** Where the last-value dot sits (percentages, so it stays round at any size). */
export function sparklineDotStyle(last: { x: number; y: number }): string {
  return `left: ${last.x}%; top: ${last.y}%`;
}

/**
 * `.mh-sparkline`: a trend line from numbers, with gaps for `null`, an optional area and a last-value dot. Colour
 * from `--mh-series-N` or the accent (`--series-N | --accent`). Parts `__svg`, `__area`, `__line`, `__dot`.
 * `role="img"` with a summary of the values.
 */
export function createSparkline(options: SparklineOptions): SparklineHandle {
  const area = svgEl('path', { class: 'mh-sparkline__area', d: '' });
  const line = svgEl('path', { class: 'mh-sparkline__line', d: '', 'vector-effect': 'non-scaling-stroke' });
  const svg = svgEl('svg', { class: 'mh-sparkline__svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  if (options.area) svg.append(area);
  svg.append(line);
  const dot = h('span', { class: 'mh-sparkline__dot', 'aria-hidden': 'true' });
  const el = h('div', { class: sparklineClass(options.color, options.size, options.area), role: 'img' }, svg);
  const setValues = (values: SparklineValues): void => {
    const g = sparklineGeometry(values, options.min, options.max);
    line.setAttribute('d', g.line);
    area.setAttribute('d', g.area);
    el.setAttribute('aria-label', sparklineSummary(options.label, values, options.format));
    if (g.last && options.dot !== false) {
      dot.setAttribute('style', sparklineDotStyle(g.last));
      el.append(dot);
    } else dot.remove();
  };
  setValues(options.values);
  return { el, setValues };
}
