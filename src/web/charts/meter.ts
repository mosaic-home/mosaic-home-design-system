import { cx } from '../dom.ts';
import { plainNumber } from './scale.ts';
import { clamp, colorModifier, node, patch, r2, sizeModifier, toDom, type ChartColor, type ChartNode, type ChartSize } from './tree.ts';

/** `level`: a row of equal LEDs filling up. `bars`: rising columns, like a signal-strength indicator. */
export type MeterMode = 'level' | 'bars';
export type MeterTone = 'ok' | 'warning' | 'danger';

/**
 * Where the meter turns amber and red. With `warning` below `danger` high values are bad (a load, a noise level);
 * with `warning` above `danger` low values are (a battery, a signal).
 */
export interface MeterZones {
  warning: number;
  danger: number;
}

export interface MeterOptions {
  value: number;
  /** The accessible name ("Wi-Fi signal"). */
  label: string;
  min?: number;
  max?: number;
  mode?: MeterMode;
  /** Number of LEDs or bars; default 10 for a level, 4 for bars. */
  segments?: number;
  zones?: MeterZones;
  /** With zones: colour each LED by its own position (`segment`, the default, like an audio meter) or all lit
   *  LEDs by the current value (`value`, like a battery). */
  colorBy?: 'segment' | 'value';
  /** A level meter standing up. */
  vertical?: boolean;
  color?: ChartColor;
  size?: ChartSize;
  /** The spoken value ("3 of 4 bars", "82%"); default the formatted value. */
  valueText?: string;
  format?: (value: number) => string;
}

export interface MeterHandle {
  el: HTMLDivElement;
  setValue(value: number, valueText?: string): void;
  update(options: MeterOptions): void;
}

/** The zone a value falls in. */
export function meterTone(value: number, zones: MeterZones | undefined): MeterTone {
  if (!zones) return 'ok';
  if (zones.warning <= zones.danger) return value >= zones.danger ? 'danger' : value >= zones.warning ? 'warning' : 'ok';
  return value <= zones.danger ? 'danger' : value <= zones.warning ? 'warning' : 'ok';
}

/** How many of `segments` are lit for a value; any value above the bottom lights at least one. */
export function meterLit(value: number, min: number, max: number, segments: number): number {
  if (!Number.isFinite(value) || value <= min || max <= min) return 0;
  return clamp(Math.round(((value - min) / (max - min)) * segments), 1, segments);
}

export function meterClass(mode: MeterMode = 'level', vertical = false, color?: ChartColor, size?: ChartSize, zones = false): string {
  return cx('mh-meter', `mh-meter--${mode}`, vertical && mode === 'level' && 'mh-meter--vertical', colorModifier('mh-meter', color), sizeModifier('mh-meter', size), zones && 'mh-meter--zones');
}

/**
 * The markup of `.mh-meter`: `role="meter"` with the value, holding one `__seg` per LED or bar, lit ones `.is-on`,
 * zone tones `.is-ok | .is-warning | .is-danger`; bars carry their height in `--_h`.
 */
export function meterTree(o: MeterOptions): ChartNode {
  const mode = o.mode ?? 'level';
  const min = o.min ?? 0;
  const max = o.max ?? 100;
  const n = Math.max(1, Math.round(o.segments ?? (mode === 'bars' ? 4 : 10)));
  const value = Number.isFinite(o.value) ? clamp(o.value, min, max) : min;
  const lit = meterLit(value, min, max, n);
  const format = o.format ?? plainNumber;
  const byValue = o.colorBy === 'value';
  const segs = Array.from({ length: n }, (_, i) => {
    const on = i < lit;
    const tone = o.zones ? (byValue ? meterTone(value, o.zones) : meterTone(min + ((max - min) * (o.zones.warning <= o.zones.danger ? i : i + 1)) / n, o.zones)) : null;
    return node('span', {
      class: cx('mh-meter__seg', on && 'is-on', tone && `is-${tone}`),
      style: mode === 'bars' ? `--_h: ${r2(((i + 1) / n) * 100)}%` : undefined,
    });
  });
  return node(
    'div',
    {
      class: meterClass(mode, o.vertical, o.color, o.size, !!o.zones),
      role: 'meter',
      'aria-label': o.label,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': value,
      'aria-valuetext': o.valueText ?? format(value),
    },
    segs,
  );
}

/**
 * `.mh-meter`: a segmented LED meter. `--level` lights a row (or, `--vertical`, a column) of LEDs up to the value;
 * `--bars` lights rising columns like a signal indicator. With zones, LEDs turn `--mh-warning` and `--mh-danger`
 * by position or by value; otherwise they take the accent or `--mh-series-N`. `role="meter"`.
 */
export function createMeter(options: MeterOptions): MeterHandle {
  let current = options;
  const el = toDom(meterTree(current)) as HTMLDivElement;
  const update = (next: MeterOptions): void => {
    current = next;
    patch(el, meterTree(next));
  };
  return { el, update, setValue: (value, valueText) => update({ ...current, value, valueText }) };
}
