import { h } from '../dom.ts';
import { createSparkline, type SparklineColor, type SparklineHandle, type SparklineValues } from './sparkline.ts';

export interface TrendOptions {
  /** What is measured ("Living room"). */
  name: string;
  /** The latest reading; `null` shows a dash. */
  value: number | null;
  /** Unit after numbers ("°C", "%", "kWh"). */
  unit?: string;
  /** Readings over time, oldest first; `null` is a gap. Drawn as a sparkline with an area. */
  values: SparklineValues;
  /** The line under the value ("19.5–21.3 °C over 12 h"). Default: low–high of `values` with the unit. */
  range?: string;
  /** Sparkline colour (default accent). */
  color?: SparklineColor;
  /** Formats numbers (value, range, the chart's accessible summary). Default: as given. */
  format?: (value: number) => string;
}

export interface TrendHandle {
  el: HTMLDivElement;
  /** Replaces everything shown. */
  update(options: TrendOptions): void;
}

/** A number with its unit after a space, "21.3 °C"; the number alone without a unit. */
export function trendWithUnit(text: string, unit?: string): string {
  return unit ? `${text} ${unit}` : text;
}

/** The big value: the formatted latest reading, or an em dash when there is none. */
export function trendValueText(value: number | null, format: (value: number) => string = String): string {
  return value === null || !Number.isFinite(value) ? '—' : format(value);
}

/** Low–high of the readings with the unit ("19.5–21.3 °C"), one value when flat, '' without data. */
export function trendRange(values: SparklineValues, unit?: string, format: (value: number) => string = String): string {
  const nums = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (nums.length === 0) return '';
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return trendWithUnit(lo === hi ? format(lo) : `${format(lo)}–${format(hi)}`, unit);
}

/** The range line actually shown: the given one, or the computed one. */
export function trendRangeText(options: Pick<TrendOptions, 'range' | 'values' | 'unit' | 'format'>): string {
  return options.range ?? trendRange(options.values, options.unit, options.format);
}

function sparkline(options: TrendOptions): SparklineHandle {
  const format = options.format ?? String;
  return createSparkline({ values: options.values, label: options.name, color: options.color, area: true, size: 'large', format: (v) => trendWithUnit(format(v), options.unit) });
}

/**
 * `.mh-trend`: a reading over time. `__text` holds `__name`, the big `__reading` (`__value` in tabular figures and
 * `__unit`) and the `__range` line; `__chart` holds a `.mh-sparkline` with an area. Side by side, wrapping to a
 * stack when narrow; consecutive trends are divided by a rule, so several sit well in one card.
 */
export function createTrend(options: TrendOptions): TrendHandle {
  const name = h('span', { class: 'mh-trend__name' });
  const value = h('span', { class: 'mh-trend__value' });
  const unit = h('span', { class: 'mh-trend__unit' });
  const reading = h('span', { class: 'mh-trend__reading' }, value);
  const range = h('span', { class: 'mh-trend__range' });
  const text = h('div', { class: 'mh-trend__text' }, name, reading);
  const chart = h('div', { class: 'mh-trend__chart' });
  const el = h('div', { class: 'mh-trend' }, text, chart);
  const update = (next: TrendOptions): void => {
    name.textContent = next.name;
    value.textContent = trendValueText(next.value, next.format);
    unit.textContent = next.unit ?? '';
    if (next.unit) reading.append(unit);
    else unit.remove();
    const r = trendRangeText(next);
    range.textContent = r;
    if (r) text.append(range);
    else range.remove();
    chart.replaceChildren(sparkline(next).el);
  };
  update(options);
  return { el, update };
}
