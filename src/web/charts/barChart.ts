import { cx } from '../dom.ts';
import { niceScale, plainNumber, tickText } from './scale.ts';
import { colorModifier, node, patch, r2, sizeModifier, toDom, type ChartColor, type ChartNode, type ChartSize } from './tree.ts';

export interface BarDatum {
  /** The short label under the column ("Mon", "14"). */
  label: string;
  /** `null` is a missing reading: no column, "no data" in the summary. */
  value: number | null;
  /** The longer name used in the accessible summary ("Monday"); default the label. */
  name?: string;
  /** Colour of this column; default the chart's. */
  color?: ChartColor;
}

export interface BarChartOptions {
  bars: readonly BarDatum[];
  /** What it shows ("Energy used per day"); the values are added for screen readers. */
  label: string;
  color?: ChartColor;
  /** Bottom and top of the scale; default a round scale over the data that includes zero. */
  min?: number;
  max?: number;
  /** Gridlines with tick labels (default true). */
  axis?: boolean;
  /** About how many steps the axis has (default 4). */
  ticks?: number;
  /** The value above each column. */
  showValues?: boolean;
  /** Index of the column to stand out ("today"); the others are dimmed. */
  highlight?: number;
  /** Show every n-th label; default 1 up to 12 columns, then about eight labels. */
  labelEvery?: number;
  size?: ChartSize;
  /** Formats values in the value labels and the summary. */
  format?: (value: number) => string;
}

export interface BarChartHandle {
  el: HTMLDivElement;
  /** Replaces everything shown. */
  update(options: BarChartOptions): void;
}

const finite = (v: number | null): v is number => v !== null && Number.isFinite(v);

/** The accessible text: every column up to 12, otherwise the count with low, high and latest. */
export function barChartSummary(label: string, bars: readonly BarDatum[], format: (value: number) => string = plainNumber): string {
  const known = bars.filter((b) => finite(b.value));
  if (known.length === 0) return `${label}: no data`;
  const name = (b: BarDatum): string => b.name ?? b.label;
  if (bars.length <= 12) return `${label}: ${bars.map((b) => `${name(b)} ${finite(b.value) ? format(b.value) : 'no data'}`).join(', ')}`;
  const lo = known.reduce((a, b) => (b.value! < a.value! ? b : a));
  const hi = known.reduce((a, b) => (b.value! > a.value! ? b : a));
  const last = known[known.length - 1]!;
  return `${label}: ${bars.length} columns, low ${format(lo.value!)} (${name(lo)}), high ${format(hi.value!)} (${name(hi)}), latest ${format(last.value!)} (${name(last)})`;
}

/** The scale of a bar chart: given bounds, or a round scale over the data and zero. */
export function barChartScale(bars: readonly BarDatum[], min?: number, max?: number, ticks = 4): { min: number; max: number; ticks: number[]; step: number } {
  const nums = bars.map((b) => b.value).filter(finite);
  const lo = Math.min(0, ...nums);
  const hi = Math.max(0, ...nums);
  const nice = niceScale(min ?? lo, max ?? hi, ticks);
  return { min: min ?? nice.min, max: max ?? nice.max, step: nice.step, ticks: nice.ticks.filter((t) => t >= (min ?? nice.min) && t <= (max ?? nice.max)) };
}

export function barChartClass(color?: ChartColor, size?: ChartSize, axis = true, highlight = false): string {
  return cx('mh-bar-chart', colorModifier('mh-bar-chart', color), sizeModifier('mh-bar-chart', size), !axis && 'mh-bar-chart--no-axis', highlight && 'mh-bar-chart--highlight');
}

/**
 * The markup of `.mh-bar-chart`: `__axis` (tick labels), `__plot` with the `__svg` (`__grid` lines, `__zero` baseline
 * and one `__bar` rect per value in a 100 x 100 box) and `__values`, then the `__labels` row. `role="img"` with a
 * summary of every value; the visible parts are hidden from screen readers.
 */
export function barChartTree(o: BarChartOptions): ChartNode {
  const format = o.format ?? plainNumber;
  const n = Math.max(1, o.bars.length);
  const axis = o.axis !== false;
  const scale = barChartScale(o.bars, o.min, o.max, o.ticks);
  const span = scale.max - scale.min || 1;
  const y = (v: number): number => r2(100 - ((Math.min(scale.max, Math.max(scale.min, v)) - scale.min) / span) * 100);
  const base = y(Math.min(scale.max, Math.max(scale.min, 0)));
  const slot = 100 / n;
  const width = slot * 0.64;
  const every = o.labelEvery ?? (n <= 12 ? 1 : Math.ceil(n / 8));
  const highlighted = o.highlight !== undefined && o.highlight >= 0 && o.highlight < o.bars.length;
  const grid = scale.ticks.map((t) => `M0 ${y(t)}H100`).join('');
  const rects = o.bars.map((b, i) => {
    if (!finite(b.value)) return null;
    const top = Math.min(y(b.value), base);
    const h = Math.abs(base - y(b.value));
    return node('rect', {
      class: cx('mh-bar-chart__bar', b.color !== undefined && colorModifier('mh-bar-chart__bar', b.color), highlighted && i === o.highlight && 'is-highlight'),
      x: r2(i * slot + (slot - width) / 2),
      y: r2(top),
      width: r2(width),
      height: r2(h),
    });
  });
  const values =
    o.showValues &&
    node(
      'div',
      { class: 'mh-bar-chart__values', 'aria-hidden': 'true' },
      o.bars.map((b, i) =>
        finite(b.value)
          ? node(
              'span',
              {
                class: cx('mh-bar-chart__value', b.value < 0 && 'is-negative', highlighted && i === o.highlight && 'is-highlight'),
                style: b.value < 0 ? `left: ${r2((i + 0.5) * slot)}%; top: ${y(b.value)}%` : `left: ${r2((i + 0.5) * slot)}%; bottom: ${r2(100 - y(b.value))}%`,
              },
              format(b.value),
            )
          : null,
      ),
    );
  const gutter = Math.max(...scale.ticks.map((t) => tickText(t, scale.step).length));
  return node(
    'div',
    { class: cx(barChartClass(o.color, o.size, axis, highlighted), o.showValues && 'mh-bar-chart--values'), role: 'img', 'aria-label': barChartSummary(o.label, o.bars, format), style: axis ? `--_gutter: ${gutter}` : undefined },
    axis &&
      node(
        'div',
        { class: 'mh-bar-chart__axis', 'aria-hidden': 'true' },
        scale.ticks.map((t) => node('span', { class: 'mh-bar-chart__tick', style: `bottom: ${r2(100 - y(t))}%` }, tickText(t, scale.step))),
      ),
    node(
      'div',
      { class: 'mh-bar-chart__plot' },
      node(
        'svg',
        { class: 'mh-bar-chart__svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
        axis && node('path', { class: 'mh-bar-chart__grid', d: grid, 'vector-effect': 'non-scaling-stroke' }),
        rects,
        node('path', { class: 'mh-bar-chart__zero', d: `M0 ${base}H100`, 'vector-effect': 'non-scaling-stroke' }),
      ),
      values,
    ),
    node(
      'div',
      { class: 'mh-bar-chart__labels', 'aria-hidden': 'true' },
      o.bars.map((b, i) =>
        node('span', { class: cx('mh-bar-chart__label', (i % every !== 0) && 'is-hidden', highlighted && i === o.highlight && 'is-highlight', !finite(b.value) && 'is-empty') }, b.label),
      ),
    ),
  );
}

/**
 * `.mh-bar-chart`: a small column chart with labels under the columns, an optional axis and value labels, and one
 * column that can stand out. Colours from `--mh-series-N` or the accent, per chart or per column; negative values
 * hang below the zero line. Fills its container's width; the height follows the size.
 */
export function createBarChart(options: BarChartOptions): BarChartHandle {
  const el = toDom(barChartTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, barChartTree(next)) };
}
