import { cx } from '../dom.ts';
import { plainNumber } from './scale.ts';
import { colorModifier, node, patch, r2, sizeModifier, toDom, type ChartColor, type ChartNode, type ChartSize } from './tree.ts';

export interface MonthGridOptions {
  year: number;
  /** 1 (January) to 12. */
  month: number;
  /** One value per day, day 1 first; `null` (or missing) is a day without data. */
  values: readonly (number | null)[];
  /** What it shows ("Energy used per day"). */
  label: string;
  color?: ChartColor;
  /** Bottom and top of the colour scale; default the data's own range. */
  min?: number;
  max?: number;
  /** Number of colour steps, 2 to 6 (default 4). */
  steps?: number;
  /** First day of the week, 0 (Sunday) to 6 (default 1, Monday). */
  weekStart?: number;
  /** Locale for the month and weekday names; default the user's. */
  locale?: string;
  /** Day of the month to outline as today. */
  today?: number;
  /** The visible caption; default the month and year ("March 2026"). */
  caption?: string;
  /** The colour scale under the grid (default true). */
  legend?: boolean;
  size?: ChartSize;
  format?: (value: number) => string;
}

export interface MonthGridHandle {
  el: HTMLDivElement;
  update(options: MonthGridOptions): void;
}

const finite = (v: number | null | undefined): v is number => v !== null && v !== undefined && Number.isFinite(v);

/** Days in a month (month 1–12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Weekday of the first day, 0 (Sunday) to 6. */
export function firstWeekday(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

/**
 * The calendar rows of a month: each row has seven day numbers (1-based) or `null` for the cells before the first and
 * after the last day.
 */
export function monthWeeks(year: number, month: number, weekStart = 1): (number | null)[][] {
  const lead = (firstWeekday(year, month) - weekStart + 7) % 7;
  const days = daysInMonth(year, month);
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Colour step of a value: 0 for no data, otherwise 1 (lowest) to `steps` (highest). */
export function heatLevel(value: number | null | undefined, lo: number, hi: number, steps = 4): number {
  if (!finite(value)) return 0;
  if (hi <= lo) return Math.ceil(steps / 2);
  const t = (Math.min(hi, Math.max(lo, value)) - lo) / (hi - lo);
  return 1 + Math.min(steps - 1, Math.floor(t * steps));
}

/** Bounds of the colour scale: given, or the data's own range. */
export function monthGridRange(values: readonly (number | null)[], min?: number, max?: number): { lo: number; hi: number } {
  const nums = values.filter(finite);
  return { lo: min ?? (nums.length ? Math.min(...nums) : 0), hi: max ?? (nums.length ? Math.max(...nums) : 0) };
}

function weekdayNames(locale: string | undefined, weekStart: number): { short: string; long: string }[] {
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  // 4 January 1970 was a Sunday.
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(1970, 0, 4 + ((weekStart + i) % 7)));
    return { short: narrow.format(d), long: long.format(d) };
  });
}

export function monthGridClass(color?: ChartColor, size?: ChartSize): string {
  return cx('mh-month-grid', colorModifier('mh-month-grid', color), sizeModifier('mh-month-grid', size));
}

/** The text of the colour scale: what range each step stands for. */
export function monthGridLegendText(lo: number, hi: number, steps: number, format: (value: number) => string = plainNumber): string {
  if (hi <= lo) return `Colour scale: ${format(lo)}`;
  const parts = Array.from({ length: steps }, (_, i) => `${format(lo + ((hi - lo) * i) / steps)} to ${format(lo + ((hi - lo) * (i + 1)) / steps)}`);
  return `Colour scale from lightest to darkest: ${parts.join(', ')}`;
}

/**
 * The markup of `.mh-month-grid`: a `<table>` calendar (`__table`, `__caption`, `__weekday` headers, `__day` cells
 * with `__num` and a visually hidden "12 March: 4.2 kWh"), then the `__legend` of the colour steps. Each cell's
 * strength is `--_t` (0–1); `.is-today`, `.is-empty` (no data) and `.is-strong` (dark enough for light text).
 */
export function monthGridTree(o: MonthGridOptions): ChartNode {
  const format = o.format ?? plainNumber;
  const steps = Math.min(6, Math.max(2, Math.round(o.steps ?? 4)));
  const weekStart = (((o.weekStart ?? 1) % 7) + 7) % 7;
  const { lo, hi } = monthGridRange(o.values, o.min, o.max);
  const anchor = new Date(Date.UTC(o.year, o.month - 1, 1));
  const caption = o.caption ?? new Intl.DateTimeFormat(o.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(anchor);
  const dayName = new Intl.DateTimeFormat(o.locale, { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const strength = (level: number): number => r2(level / steps);
  const cell = (day: number | null): ChartNode => {
    if (day === null) return node('td', { class: 'mh-month-grid__pad' });
    const v = o.values[day - 1];
    const level = heatLevel(v, lo, hi, steps);
    const text = `${dayName.format(new Date(Date.UTC(o.year, o.month - 1, day)))}: ${finite(v) ? format(v) : 'no data'}${o.today === day ? ', today' : ''}`;
    return node(
      'td',
      {
        class: cx('mh-month-grid__day', level === 0 && 'is-empty', level / steps > 0.6 && 'is-strong', o.today === day && 'is-today'),
        style: level ? `--_t: ${strength(level)}` : undefined,
      },
      node('span', { class: 'mh-month-grid__num', 'aria-hidden': 'true' }, String(day)),
      node('span', { class: 'mh-visually-hidden' }, text),
    );
  };
  const legend =
    o.legend !== false &&
    node(
      'div',
      { class: 'mh-month-grid__legend', role: 'img', 'aria-label': monthGridLegendText(lo, hi, steps, format) },
      node('span', { class: 'mh-month-grid__end', 'aria-hidden': 'true' }, format(lo)),
      Array.from({ length: steps }, (_, i) => node('span', { class: 'mh-month-grid__swatch', 'aria-hidden': 'true', style: `--_t: ${strength(i + 1)}` })),
      node('span', { class: 'mh-month-grid__end', 'aria-hidden': 'true' }, format(hi)),
    );
  return node(
    'div',
    { class: monthGridClass(o.color, o.size) },
    node(
      'table',
      { class: 'mh-month-grid__table', 'aria-label': `${o.label}, ${caption}` },
      node('caption', { class: 'mh-month-grid__caption' }, caption),
      node(
        'thead',
        {},
        node(
          'tr',
          {},
          weekdayNames(o.locale, weekStart).map((d) =>
            node('th', { class: 'mh-month-grid__weekday', scope: 'col', abbr: d.long }, node('span', { 'aria-hidden': 'true' }, d.short), node('span', { class: 'mh-visually-hidden' }, d.long)),
          ),
        ),
      ),
      node(
        'tbody',
        {},
        monthWeeks(o.year, o.month, weekStart).map((week) => node('tr', {}, week.map(cell))),
      ),
    ),
    legend,
  );
}

/**
 * `.mh-month-grid`: a calendar heat map. One cell per day, coloured in `steps` strengths of `--mh-series-N` or the
 * accent from the lowest to the highest value; days without data are outlined only. A real table, so screen readers
 * can move by week and weekday and hear each day's value; the legend reads out the scale.
 */
export function createMonthGrid(options: MonthGridOptions): MonthGridHandle {
  const el = toDom(monthGridTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, monthGridTree(next)) };
}
