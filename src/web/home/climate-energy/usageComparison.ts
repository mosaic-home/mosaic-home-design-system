import { mdiArrowDown, mdiArrowUp, mdiEqual } from '@mdi/js';
import { niceScale, plainNumber, tickText } from '../../charts/scale.ts';
import { node, patch, r2, sizeModifier, toDom, type ChartNode, type ChartSize } from '../../charts/tree.ts';
import { cx } from '../../dom.ts';
import { iconTree, isNum } from './shared.ts';

/** Every visible and spoken word, for translation. */
export interface UsageComparisonLabels {
  more: string;
  less: string;
  same: string;
  /** After the earlier period's total when only part of the current one has passed ("by this time"). */
  byNow: string;
  /** Before the earlier period's full total ("in all"). */
  inAll: string;
  /** Joins this period's value to the earlier one in the spoken list ("Monday 4 against 5"). */
  against: string;
  noData: string;
}

export const USAGE_COMPARISON_LABELS: UsageComparisonLabels = { more: 'more', less: 'less', same: 'About the same', byNow: 'by this time', inAll: 'in all', against: 'against', noData: 'no data' };

export interface UsageComparisonOptions {
  /** What is compared (default "Energy use"). */
  label?: string;
  /** Labels under the columns, one per slot ("0" … "23", "Mon" … "Sun"). */
  slots: readonly string[];
  /** Longer names of the slots for screen readers ("Monday"); default the labels. */
  slotNames?: readonly string[];
  /** This period, one value per slot; slots still to come are `null` or missing. */
  current: readonly (number | null)[];
  /** The period before, one value per slot. */
  previous: readonly (number | null)[];
  /** Names of the two periods (default "Today" and "Yesterday"). */
  periods?: { current: string; previous: string };
  /** After the totals ("kWh"). */
  unit?: string;
  /** Slots of this period that have passed (default up to its last known value); totals compare like with like. */
  upTo?: number;
  /** Whether a higher total is the good direction (production rather than use; default false). */
  higherIsBetter?: boolean;
  /** Differences smaller than this share of the earlier total count as the same (default 0.03). */
  same?: number;
  /** Formats values (default up to two decimals). */
  format?: (value: number) => string;
  /** Show every n-th slot label; default 1 up to 12 slots, then every sixth. */
  labelEvery?: number;
  size?: ChartSize;
  labels?: Partial<UsageComparisonLabels>;
}

export interface UsageComparisonHandle {
  el: HTMLDivElement;
  /** Replaces everything shown. */
  update(options: UsageComparisonOptions): void;
}

export interface UsageTotals {
  /** Slots compared. */
  upTo: number;
  current: number;
  /** The earlier period over the same slots. */
  previousSoFar: number;
  /** The earlier period over every slot. */
  previousAll: number;
  difference: number;
  /** Difference over `previousSoFar`; null when that is zero. */
  ratio: number | null;
  trend: 'more' | 'less' | 'same';
}

const sum = (values: readonly (number | null)[], to: number): number => values.slice(0, to).reduce<number>((a, v) => a + (isNum(v) ? v : 0), 0);

/** Totals of both periods over the slots that have passed, and how they differ. */
export function usageTotals(o: Pick<UsageComparisonOptions, 'current' | 'previous' | 'upTo' | 'same' | 'slots'>): UsageTotals {
  let last = -1;
  o.current.forEach((v, i) => {
    if (isNum(v)) last = i;
  });
  const upTo = Math.max(0, Math.min(o.upTo ?? last + 1, Math.max(o.slots.length, o.current.length)));
  const current = sum(o.current, upTo);
  const previousSoFar = sum(o.previous, upTo);
  const previousAll = sum(o.previous, o.previous.length);
  const difference = current - previousSoFar;
  const ratio = previousSoFar !== 0 ? difference / Math.abs(previousSoFar) : null;
  const still = o.same ?? 0.03;
  const trend = ratio === null ? (Math.abs(difference) < 1e-9 ? 'same' : difference > 0 ? 'more' : 'less') : Math.abs(ratio) < still ? 'same' : difference > 0 ? 'more' : 'less';
  return { upTo, current, previousSoFar, previousAll, difference, ratio, trend };
}

/** The difference line ("1.4 kWh less · 15%") or "About the same". */
export function usageDifferenceText(t: UsageTotals, o: Pick<UsageComparisonOptions, 'format' | 'unit' | 'labels'>): string {
  const l = { ...USAGE_COMPARISON_LABELS, ...o.labels };
  if (t.trend === 'same') return l.same;
  const fmt = o.format ?? plainNumber;
  const pct = t.ratio === null ? '' : ` · ${Math.round(Math.abs(t.ratio) * 100)}%`;
  return `${fmt(Math.abs(t.difference))}${o.unit ? ` ${o.unit}` : ''} ${t.trend === 'more' ? l.more : l.less}${pct}`;
}

/** Whether the difference is good, bad or neither, given which way is better. */
export function usageTone(trend: UsageTotals['trend'], higherIsBetter = false): 'good' | 'bad' | 'neutral' {
  if (trend === 'same') return 'neutral';
  return (trend === 'more') === higherIsBetter ? 'good' : 'bad';
}

export function usageComparisonClass(size?: ChartSize): string {
  return cx('mh-usage-comparison', sizeModifier('mh-usage-comparison', size));
}

const TREND_ICON = { more: mdiArrowUp, less: mdiArrowDown, same: mdiEqual } as const;

/**
 * The markup of `.mh-usage-comparison`: `__head` (`__total` with `__period`, `__value`, `__unit`; the `__previous`
 * line; the `__difference` badge, `--good | --bad | --neutral`), the `__chart` (`__axis` ticks and the `__plot`,
 * `role="img"` with a summary, holding one `__slot` per slot with the earlier `__bar--previous` behind this
 * period's `__bar--current`), the `__labels` row and the `__legend`.
 */
export function usageComparisonTree(o: UsageComparisonOptions): ChartNode {
  const l = { ...USAGE_COMPARISON_LABELS, ...o.labels };
  const fmt = o.format ?? plainNumber;
  const periods = o.periods ?? { current: 'Today', previous: 'Yesterday' };
  const label = o.label ?? 'Energy use';
  const t = usageTotals(o);
  const n = Math.max(1, o.slots.length);
  const all = [...o.current.slice(0, n), ...o.previous.slice(0, n)].filter(isNum);
  const scale = niceScale(0, Math.max(0, ...all), 3);
  const top = scale.max || 1;
  const pct = (v: number): number => r2((Math.max(0, Math.min(v, top)) / top) * 100);
  const every = o.labelEvery ?? (n <= 12 ? 1 : 6);
  const unit = o.unit ? ` ${o.unit}` : '';
  const partial = t.upTo < n;
  const tone = usageTone(t.trend, o.higherIsBetter);
  const diff = usageDifferenceText(t, o);
  const prevLine = partial ? `${periods.previous} ${fmt(t.previousSoFar)}${unit} ${l.byNow} · ${fmt(t.previousAll)}${unit} ${l.inAll}` : `${periods.previous} ${fmt(t.previousAll)}${unit}`;
  const names = o.slotNames ?? o.slots;
  const perSlot =
    n <= 12
      ? `; ${o.slots
          .map((_, i) => {
            const c = o.current[i];
            const p = o.previous[i];
            return `${names[i] ?? o.slots[i]} ${isNum(c) ? fmt(c) : l.noData} ${l.against} ${isNum(p) ? fmt(p) : l.noData}`;
          })
          .join(', ')}`
      : '';
  const summary = `${label}: ${periods.current} ${fmt(t.current)}${unit}, ${prevLine}, ${diff}${perSlot}`;
  const gutter = Math.max(...scale.ticks.map((x) => tickText(x, scale.step).length));
  return node(
    'div',
    { class: usageComparisonClass(o.size), role: 'group', 'aria-label': label },
    node(
      'div',
      { class: 'mh-usage-comparison__head', 'aria-hidden': 'true' },
      node(
        'div',
        { class: 'mh-usage-comparison__total' },
        node('span', { class: 'mh-usage-comparison__period' }, periods.current),
        node('span', { class: 'mh-usage-comparison__value' }, fmt(t.current), o.unit && node('span', { class: 'mh-usage-comparison__unit' }, o.unit)),
      ),
      node('span', { class: 'mh-usage-comparison__previous' }, prevLine),
      node('span', { class: `mh-usage-comparison__difference mh-usage-comparison__difference--${tone}` }, iconTree(TREND_ICON[t.trend]), diff),
    ),
    node(
      'div',
      { class: 'mh-usage-comparison__chart', style: `--_gutter: ${gutter}` },
      node(
        'div',
        { class: 'mh-usage-comparison__axis', 'aria-hidden': 'true' },
        scale.ticks.map((x) => node('span', { class: 'mh-usage-comparison__tick', style: `bottom: ${pct(x)}%` }, tickText(x, scale.step))),
      ),
      node(
        'div',
        { class: 'mh-usage-comparison__plot', role: 'img', 'aria-label': summary },
        scale.ticks.map((x) => node('span', { class: 'mh-usage-comparison__grid', style: `bottom: ${pct(x)}%` })),
        o.slots.map((_, i) => {
          const c = o.current[i];
          const p = o.previous[i];
          return node(
            'span',
            { class: cx('mh-usage-comparison__slot', i >= t.upTo && 'is-ahead') },
            isNum(p) && node('span', { class: 'mh-usage-comparison__bar mh-usage-comparison__bar--previous', style: `height: ${pct(p)}%` }),
            isNum(c) && i < t.upTo && node('span', { class: 'mh-usage-comparison__bar mh-usage-comparison__bar--current', style: `height: ${pct(c)}%` }),
          );
        }),
      ),
      node(
        'div',
        { class: 'mh-usage-comparison__labels', 'aria-hidden': 'true' },
        o.slots.map((s, i) => node('span', { class: cx('mh-usage-comparison__label', i % every !== 0 && 'is-hidden') }, s)),
      ),
    ),
    node(
      'div',
      { class: 'mh-usage-comparison__legend', 'aria-hidden': 'true' },
      node('span', { class: 'mh-usage-comparison__key mh-usage-comparison__key--current' }, periods.current),
      node('span', { class: 'mh-usage-comparison__key mh-usage-comparison__key--previous' }, periods.previous),
    ),
  );
}

/**
 * `.mh-usage-comparison`: this period against the one before, slot by slot (hours of today and yesterday, days of
 * this week and last). The earlier period is a muted column behind each of this period's columns; the head gives
 * both totals over the same slots and the difference, coloured by whether it is the good direction.
 */
export function createUsageComparison(options: UsageComparisonOptions): UsageComparisonHandle {
  const el = toDom(usageComparisonTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, usageComparisonTree(next)) };
}
