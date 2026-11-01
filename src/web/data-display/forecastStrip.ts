import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { formatTemperature, weatherIcon, weatherIconClass, weatherWord, type WeatherCondition } from '../home/weather.ts';

/** `days`: up to seven equal columns. `hours`: a fixed-width row that scrolls sideways and snaps. */
export type ForecastStripVariant = 'days' | 'hours';
/** `outside` mutes a reading (outside the range or period the content is about). */
export type ForecastReadingState = 'within' | 'outside';

export interface ForecastReading {
  /** "Wed", "14:00". */
  label: string;
  condition?: WeatherCondition | null;
  /** The source's own words, spoken instead of the generic word. */
  conditionText?: string | null;
  /** The reading (the high, for days). */
  value: number | null;
  /** The low, for days. */
  low?: number | null;
  /** A short extra line ("60%"). */
  sub?: string | null;
  state?: ForecastReadingState;
}

export interface ForecastStripOptions {
  /** Required: the list's accessible name ("Next 7 days"). */
  label: string;
  readings: readonly ForecastReading[];
  /** Appended to values (default "°"). */
  unit?: string;
  variant?: ForecastStripVariant;
  /** Spoken after `sub` ("rain" makes "80% rain"). */
  subName?: string;
}

export interface ForecastStripHandle {
  el: HTMLDivElement;
  update(options: ForecastStripOptions): void;
}

/** Most columns the `days` variant shows. */
export const FORECAST_DAYS_MAX = 7;

export function forecastStripClass(variant: ForecastStripVariant = 'days'): string {
  return cx('mh-forecast-strip', `mh-forecast-strip--${variant}`);
}

export function forecastItemClass(reading: Pick<ForecastReading, 'state'>): string {
  return cx('mh-forecast-strip__item', reading.state === 'outside' && 'is-outside');
}

/** The readings a variant shows: days keep the first seven. */
export function forecastVisible(readings: readonly ForecastReading[], variant: ForecastStripVariant = 'days'): readonly ForecastReading[] {
  return variant === 'days' ? readings.slice(0, FORECAST_DAYS_MAX) : readings;
}

const present = (n: number | null | undefined): n is number => n !== null && n !== undefined && Number.isFinite(n);

/** The spoken text of one reading: "Wed: Rain, high 15°, low 9°, 80% rain". */
export function forecastItemLabel(reading: ForecastReading, options: Pick<ForecastStripOptions, 'unit' | 'variant' | 'subName'> = {}): string {
  const unit = options.unit ?? '°';
  const parts: string[] = [];
  const word = reading.conditionText?.trim() || weatherWord(reading.condition);
  if (word) parts.push(word);
  const hasLow = (options.variant ?? 'days') === 'days' && present(reading.low);
  if (present(reading.value)) parts.push(hasLow ? `high ${formatTemperature(reading.value, unit)}` : formatTemperature(reading.value, unit));
  else parts.push('no reading');
  if (hasLow) parts.push(`low ${formatTemperature(reading.low, unit)}`);
  const sub = reading.sub?.trim();
  if (sub) parts.push(options.subName ? `${sub} ${options.subName}` : sub);
  return `${reading.label}: ${parts.join(', ')}`;
}

/**
 * `.mh-forecast-strip` (`--days | --hours`): a `__list` (`role="list"`, named by `label`) of `__item`s (`.is-outside`
 * mutes one). Each item has a visually hidden sentence for screen readers and, hidden from them, `__label`, a
 * tinted `.mh-weather-icon`, `__value`, `__low` (days) and `__sub`. Days share the width in up to seven equal
 * columns; hours scroll sideways with snap, no visible scrollbar, and the list is focusable for arrow-key scrolling.
 */
export function createForecastStrip(options: ForecastStripOptions): ForecastStripHandle {
  const el = h('div');
  const update = (next: ForecastStripOptions): void => {
    const variant = next.variant ?? 'days';
    const unit = next.unit ?? '°';
    el.className = forecastStripClass(variant);
    const items = forecastVisible(next.readings, variant).map((r) =>
      h(
        'li',
        { class: forecastItemClass(r) },
        h('span', { class: 'mh-visually-hidden' }, forecastItemLabel(r, next)),
        h('span', { class: 'mh-forecast-strip__label', 'aria-hidden': 'true' }, r.label),
        createIcon(weatherIcon(r.condition), { class: weatherIconClass(r.condition, 'mh-forecast-strip__icon') }),
        h('span', { class: 'mh-forecast-strip__value', 'aria-hidden': 'true' }, formatTemperature(r.value, unit)),
        variant === 'days' && present(r.low) ? h('span', { class: 'mh-forecast-strip__low', 'aria-hidden': 'true' }, formatTemperature(r.low, unit)) : null,
        r.sub?.trim() ? h('span', { class: 'mh-forecast-strip__sub', 'aria-hidden': 'true' }, r.sub.trim()) : null,
      ),
    );
    const list = h('ul', { class: 'mh-forecast-strip__list', role: 'list', 'aria-label': next.label, tabindex: variant === 'hours' ? 0 : null }, ...items);
    list.style.setProperty('--_n', String(Math.max(1, items.length)));
    el.replaceChildren(list);
  };
  update(options);
  return { el, update };
}
