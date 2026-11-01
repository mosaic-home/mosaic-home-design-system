import { cx } from '../dom.ts';
import { niceScale } from './scale.ts';
import { clamp, node, patch, r2, sizeModifier, toDom, type ChartNode, type ChartSize } from './tree.ts';

export interface LevelMeterOptions {
  /** Current level per channel in dB (dBFS by default: -60 to 0). `-Infinity` is silence. */
  levels: readonly number[];
  /** The accessible name ("Microphone level"). */
  label: string;
  /** Short channel names shown beside each bar ("L", "R"); also part of each bar's accessible name. */
  channels?: readonly string[];
  /** Bottom and top of the scale in dB (default -60 and 0). */
  min?: number;
  max?: number;
  /** Where the bar turns amber and red (default -12 and -3 dB). */
  warning?: number;
  danger?: number;
  /** Peak markers per channel, in dB. Without them `createLevelMeter` holds the peaks itself. */
  peaks?: readonly number[];
  /** How long a peak stays before it falls, in ms (default 1500), and how fast it falls in dB per second (default 20). */
  peakHold?: number;
  peakDecay?: number;
  orientation?: 'horizontal' | 'vertical';
  /** dB tick labels along the bars. */
  scale?: boolean;
  /** LED-style segments instead of a smooth bar. */
  segmented?: boolean;
  size?: ChartSize;
}

export interface LevelMeterHandle {
  el: HTMLDivElement;
  /** New levels; peaks are held and released over time (`now` in ms, default `performance.now()`). */
  setLevels(levels: readonly number[], now?: number): void;
  update(options: LevelMeterOptions): void;
}

/** A held peak: the level it reached and when. */
export interface PeakHold {
  value: number;
  at: number;
}

/**
 * Peak hold: a new peak replaces the old one; an old peak stays for `holdMs`, then falls at `decay` dB per second
 * until the level catches it. Returns the new state and the value to show.
 */
export function holdPeak(prev: PeakHold | undefined, level: number, now: number, holdMs = 1500, decay = 20): { state: PeakHold; shown: number } {
  if (!prev || level >= prev.value) return { state: { value: level, at: now }, shown: level };
  const since = now - prev.at;
  const shown = since <= holdMs ? prev.value : prev.value - ((since - holdMs) / 1000) * decay;
  if (shown <= level) return { state: { value: level, at: now }, shown: level };
  return { state: prev, shown };
}

/** Position of a level on the scale, 0 to 1 (linear in dB). */
export function levelFraction(db: number, min = -60, max = 0): number {
  if (!Number.isFinite(db)) return db > 0 ? 1 : 0;
  return max > min ? clamp((db - min) / (max - min), 0, 1) : 0;
}

/** Spoken level: "-12 dB", "below -60 dB", "clipping". */
export function levelText(db: number, min = -60, max = 0): string {
  if (!(db > min)) return `below ${min} dB`;
  if (db >= max) return 'clipping';
  return `${Math.round(db)} dB`;
}

export function levelMeterClass(orientation: 'horizontal' | 'vertical' = 'horizontal', segmented = false, size?: ChartSize): string {
  return cx('mh-level-meter', orientation === 'vertical' && 'mh-level-meter--vertical', segmented && 'mh-level-meter--segmented', sizeModifier('mh-level-meter', size));
}

/**
 * The markup of `.mh-level-meter`: a group of `__channel`s, each with an optional `__name` and a `__track`
 * (`role="meter"`) holding the `__fill` and the `__peak` marker (`.is-clip` at the top), then the optional `__scale`.
 * Levels are `--_level` and `--_peak` (0–1) on the track; the zone stops are `--_warn` and `--_danger` on the root.
 */
export function levelMeterTree(o: LevelMeterOptions, peaks: readonly number[] = o.peaks ?? []): ChartNode {
  const min = o.min ?? -60;
  const max = o.max ?? 0;
  const warn = levelFraction(o.warning ?? -12, min, max);
  const danger = levelFraction(o.danger ?? -3, min, max);
  const names = o.channels ?? [];
  const count = Math.max(o.levels.length, names.length, 1);
  const channel = (i: number): ChartNode => {
    const level = o.levels[i] ?? -Infinity;
    const name = names[i];
    const peak = peaks[i];
    const hasPeak = peak !== undefined && peak > min;
    return node(
      'div',
      { class: 'mh-level-meter__channel' },
      name !== undefined && node('span', { class: 'mh-level-meter__name', 'aria-hidden': 'true' }, name),
      node(
        'div',
        {
          class: 'mh-level-meter__track',
          role: 'meter',
          'aria-label': name !== undefined ? `${o.label}, ${name}` : count > 1 ? `${o.label}, channel ${i + 1}` : o.label,
          'aria-valuemin': min,
          'aria-valuemax': max,
          'aria-valuenow': r2(clamp(Number.isFinite(level) ? level : min, min, max)),
          'aria-valuetext': levelText(level, min, max),
          style: `--_level: ${r2(levelFraction(level, min, max))}; --_peak: ${hasPeak ? r2(levelFraction(peak, min, max)) : 0}`,
        },
        node('span', { class: 'mh-level-meter__fill' }),
        hasPeak && node('span', { class: cx('mh-level-meter__peak', peak >= max && 'is-clip') }),
      ),
    );
  };
  const ticks = niceScale(min, max, 4).ticks.filter((t) => t >= min && t <= max);
  return node(
    'div',
    { class: levelMeterClass(o.orientation, o.segmented, o.size), role: 'group', 'aria-label': o.label, style: `--_warn: ${r2(warn * 100)}%; --_danger: ${r2(danger * 100)}%` },
    node('div', { class: 'mh-level-meter__channels' }, Array.from({ length: count }, (_, i) => channel(i))),
    o.scale &&
      node(
        'div',
        { class: cx('mh-level-meter__scale', names.length > 0 && 'has-names'), 'aria-hidden': 'true' },
        ticks.map((t) => node('span', { class: 'mh-level-meter__tick', style: `--_at: ${r2(levelFraction(t, min, max) * 100)}%` }, String(t))),
      ),
  );
}

/**
 * `.mh-level-meter`: audio level per channel with peak hold. The bar shows `--mh-success`, then `--mh-warning`
 * from the warning level and `--mh-danger` from the danger level; the peak marker stays put for a moment, then
 * falls. Horizontal or `--vertical`, smooth or `--segmented`. Built for frame-rate updates: `setLevels` only
 * touches attributes.
 */
export function createLevelMeter(options: LevelMeterOptions): LevelMeterHandle {
  let current = options;
  let holds: (PeakHold | undefined)[] = [];
  const peaksFor = (levels: readonly number[], now: number): number[] =>
    levels.map((l, i) => {
      const { state, shown } = holdPeak(holds[i], Number.isFinite(l) ? l : -Infinity, now, current.peakHold, current.peakDecay);
      holds[i] = state;
      return shown;
    });
  const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const render = (t: number): ChartNode => levelMeterTree(current, current.peaks ?? peaksFor(current.levels, t));
  const el = toDom(render(now())) as HTMLDivElement;
  return {
    el,
    setLevels(levels, t = now()) {
      current = { ...current, levels };
      patch(el, render(t));
    },
    update(next) {
      if ((next.channels?.length ?? next.levels.length) !== (current.channels?.length ?? current.levels.length)) holds = [];
      current = next;
      patch(el, render(now()));
    },
  };
}
