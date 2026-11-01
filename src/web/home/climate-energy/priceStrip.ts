import { niceScale } from '../../charts/scale.ts';
import { node, patch, r2, sizeModifier, toDom, type ChartNode, type ChartSize } from '../../charts/tree.ts';
import { cx } from '../../dom.ts';
import { isNum } from './shared.ts';

export interface PriceSlot {
  /** The short label under the column ("14"). */
  label: string;
  /** When it starts, for the window text and screen readers ("14:00"); default the label. */
  name?: string;
  /** Price for the slot; `null` when not known yet. */
  value: number | null;
}

/** Every visible and spoken word, for translation. */
export interface PriceStripLabels {
  now: string;
  /** Before the cheapest window's times ("Cheapest"). */
  cheapest: string;
  average: string;
  low: string;
  high: string;
  noData: string;
}

export const PRICE_STRIP_LABELS: PriceStripLabels = { now: 'Now', cheapest: 'Cheapest', average: 'average', low: 'low', high: 'high', noData: 'no data' };

export interface PriceStripOptions {
  /** The slots in time order (hours, half hours). */
  prices: readonly PriceSlot[];
  /** What it shows (default "Energy prices"). */
  label?: string;
  /** Index of the slot running now; earlier ones are dimmed. */
  current?: number;
  /** Length of the cheapest window to find, in slots (default 3; 0 for none). */
  window?: number;
  /** The first slot the window may start at (default the current one, or the first). */
  windowFrom?: number;
  /** After the prices in the text ("/kWh"); the columns show numbers only. */
  unit?: string;
  /** Formats prices (default two decimals). */
  format?: (value: number) => string;
  /** Show every n-th label; default 1 up to 12 slots, then every third. */
  labelEvery?: number;
  /** Shown after the last slot's start, as the end of a window that runs to the end ("24:00"). */
  end?: string;
  size?: ChartSize;
  labels?: Partial<PriceStripLabels>;
}

export interface PriceStripHandle {
  el: HTMLDivElement;
  /** Replaces everything shown. */
  update(options: PriceStripOptions): void;
}

export interface PriceWindow {
  /** First slot. */
  start: number;
  /** One past the last slot. */
  end: number;
  average: number;
}

/** The run of `length` slots with the lowest average price, starting at or after `from`; every slot must be known. */
export function priceCheapestWindow(values: readonly (number | null)[], length: number, from = 0): PriceWindow | null {
  if (length < 1) return null;
  let best: PriceWindow | null = null;
  for (let s = Math.max(0, from); s + length <= values.length; s += 1) {
    const run = values.slice(s, s + length);
    if (!run.every(isNum)) continue;
    const average = (run as number[]).reduce((a, b) => a + b, 0) / length;
    if (!best || average < best.average - 1e-12) best = { start: s, end: s + length, average };
  }
  return best;
}

/** Low, mid or high: which third of the known prices' range a price is in. */
export function priceLevel(value: number, lo: number, hi: number): 'low' | 'mid' | 'high' {
  if (hi - lo <= 1e-12) return 'mid';
  const f = (value - lo) / (hi - lo);
  return f < 1 / 3 ? 'low' : f < 2 / 3 ? 'mid' : 'high';
}

export const formatPrice = (value: number): string => value.toFixed(2);

const nameOf = (s: PriceSlot): string => s.name ?? s.label;

/** The times of a window ("02:00–05:00"): the next slot's start is its end. */
export function priceWindowText(prices: readonly PriceSlot[], w: PriceWindow, end?: string): string {
  const last = prices[w.end] ? nameOf(prices[w.end]!) : (end ?? nameOf(prices[w.end - 1]!));
  return `${nameOf(prices[w.start]!)}–${last}`;
}

/** The accessible text: now, low, high and the cheapest window. */
export function priceStripSummary(o: PriceStripOptions): string {
  const l = { ...PRICE_STRIP_LABELS, ...o.labels };
  const fmt = (v: number): string => `${(o.format ?? formatPrice)(v)}${o.unit ?? ''}`;
  const label = o.label ?? 'Energy prices';
  const known = o.prices.map((p, i) => ({ p, i })).filter((x) => isNum(x.p.value));
  if (known.length === 0) return `${label}: ${l.noData}`;
  const lo = known.reduce((a, b) => (b.p.value! < a.p.value! ? b : a));
  const hi = known.reduce((a, b) => (b.p.value! > a.p.value! ? b : a));
  const parts = [`${o.prices.length} slots from ${nameOf(o.prices[0]!)}`];
  const cur = o.current !== undefined ? o.prices[o.current] : undefined;
  if (cur && isNum(cur.value)) parts.push(`${l.now.toLowerCase()} ${fmt(cur.value)}`);
  parts.push(`${l.low} ${fmt(lo.p.value!)} at ${nameOf(lo.p)}`, `${l.high} ${fmt(hi.p.value!)} at ${nameOf(hi.p)}`);
  const w = priceCheapestWindow(o.prices.map((p) => p.value), o.window ?? 3, o.windowFrom ?? o.current ?? 0);
  if (w) parts.push(`${l.cheapest.toLowerCase()} ${priceWindowText(o.prices, w, o.end)}, ${l.average} ${fmt(w.average)}`);
  return `${label}: ${parts.join(', ')}`;
}

export function priceStripClass(size?: ChartSize): string {
  return cx('mh-price-strip', sizeModifier('mh-price-strip', size));
}

/**
 * The markup of `.mh-price-strip`: `__head` (`__now` price and `__cheap` window, each a `__stat` with `__stat-label`
 * and `__stat-value`), the `__plot` (`role="img"` with the summary) holding the `__window` band, the `__zero` line
 * and one `__slot` per price with its `__bar` (`--low | --mid | --high`; `.is-now`, `.is-past`, `.is-cheap`), then
 * the `__labels` row.
 */
export function priceStripTree(o: PriceStripOptions): ChartNode {
  const l = { ...PRICE_STRIP_LABELS, ...o.labels };
  const fmt = o.format ?? formatPrice;
  const n = Math.max(1, o.prices.length);
  const values = o.prices.map((p) => p.value);
  const known = values.filter(isNum);
  const lo = known.length ? Math.min(...known) : 0;
  const hi = known.length ? Math.max(...known) : 1;
  const scale = niceScale(Math.min(0, lo), Math.max(0, hi), 3);
  const span = scale.max - scale.min || 1;
  const at = (v: number): number => r2(((v - scale.min) / span) * 100);
  const zero = at(0);
  const w = priceCheapestWindow(values, o.window ?? 3, o.windowFrom ?? o.current ?? 0);
  const every = o.labelEvery ?? (n <= 12 ? 1 : 3);
  const cur = o.current !== undefined ? o.prices[o.current] : undefined;
  const unit = o.unit ? node('span', { class: 'mh-price-strip__unit' }, o.unit) : null;
  return node(
    'div',
    { class: priceStripClass(o.size), role: 'group', 'aria-label': o.label ?? 'Energy prices' },
    node(
      'div',
      { class: 'mh-price-strip__head', 'aria-hidden': 'true' },
      cur &&
        node(
          'div',
          { class: 'mh-price-strip__stat mh-price-strip__now' },
          node('span', { class: 'mh-price-strip__stat-label' }, l.now),
          node('span', { class: 'mh-price-strip__stat-value' }, isNum(cur.value) ? fmt(cur.value) : '–', isNum(cur.value) && unit),
        ),
      w &&
        node(
          'div',
          { class: 'mh-price-strip__stat mh-price-strip__cheap' },
          node('span', { class: 'mh-price-strip__stat-label' }, l.cheapest),
          node('span', { class: 'mh-price-strip__stat-value' }, priceWindowText(o.prices, w, o.end)),
          node('span', { class: 'mh-price-strip__stat-note' }, `${l.average} ${fmt(w.average)}${o.unit ?? ''}`),
        ),
    ),
    node(
      'div',
      { class: 'mh-price-strip__plot', role: 'img', 'aria-label': priceStripSummary(o) },
      w && node('span', { class: 'mh-price-strip__window', style: `left: ${r2((w.start / n) * 100)}%; width: ${r2(((w.end - w.start) / n) * 100)}%` }),
      scale.min < 0 && node('span', { class: 'mh-price-strip__zero', style: `bottom: ${zero}%` }),
      o.prices.map((p, i) => {
        const v = p.value;
        const cls = cx(
          'mh-price-strip__slot',
          o.current !== undefined && i < o.current && 'is-past',
          i === o.current && 'is-now',
          w && i >= w.start && i < w.end && 'is-cheap',
          !isNum(v) && 'is-empty',
        );
        if (!isNum(v)) return node('span', { class: cls });
        const top = Math.max(at(v), zero);
        const bottom = Math.min(at(v), zero);
        return node('span', { class: cls }, node('span', { class: `mh-price-strip__bar mh-price-strip__bar--${priceLevel(v, lo, hi)}`, style: `bottom: ${bottom}%; height: ${r2(Math.max(top - bottom, 0))}%` }));
      }),
    ),
    node(
      'div',
      { class: 'mh-price-strip__labels', 'aria-hidden': 'true' },
      o.prices.map((p, i) => node('span', { class: cx('mh-price-strip__label', i % every !== 0 && i !== o.current && 'is-hidden', i === o.current && 'is-now') }, p.label)),
    ),
  );
}

/**
 * `.mh-price-strip`: energy prices per slot as columns coloured low, mid or high within the day's range, the slot
 * running now outlined and the cheapest run of slots ahead (default three) shaded behind, with its times and
 * average in the head. Negative prices hang below a zero line.
 */
export function createPriceStrip(options: PriceStripOptions): PriceStripHandle {
  const el = toDom(priceStripTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, priceStripTree(next)) };
}
