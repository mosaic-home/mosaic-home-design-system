import { mdiTrendingDown, mdiTrendingNeutral, mdiTrendingUp } from '@mdi/js';
import { sparklineGeometry } from '../../charts/sparkline.ts';
import { node, patch, r2, toDom, type ChartNode } from '../../charts/tree.ts';
import { cx } from '../../dom.ts';
import { clampTo, iconTree, isNum } from './shared.ts';

/** What is measured. `other` takes its name, unit and bands from the options. */
export type AirQualityKind = 'co2' | 'pm25' | 'pm10' | 'voc' | 'other';

/** The level words, best first. */
export type AirQualityLevel = 'good' | 'moderate' | 'poor' | 'very-poor';

export const AIR_QUALITY_LEVELS: readonly AirQualityLevel[] = ['good', 'moderate', 'poor', 'very-poor'];

/** Where each level starts (a reading at or above `poor` is poor) and the end of the drawn scale. */
export interface AirQualityBands {
  moderate: number;
  poor: number;
  veryPoor: number;
  max: number;
}

export interface AirQualityPreset {
  name: string;
  unit: string;
  bands: AirQualityBands;
}

/**
 * Starting points from widely published indoor and outdoor guidance: carbon dioxide in ppm (fresh air is about
 * 420; above 1000 rooms feel stuffy), fine particles and particles in µg/m³ around the daily guideline values, and
 * total volatile organic compounds in ppb. Pass `bands` to use local limits instead.
 */
export const AIR_QUALITY_PRESETS: Record<Exclude<AirQualityKind, 'other'>, AirQualityPreset> = {
  co2: { name: 'Carbon dioxide', unit: 'ppm', bands: { moderate: 800, poor: 1200, veryPoor: 2000, max: 2500 } },
  pm25: { name: 'Fine particles', unit: 'µg/m³', bands: { moderate: 15, poor: 35, veryPoor: 55, max: 75 } },
  pm10: { name: 'Particles', unit: 'µg/m³', bands: { moderate: 45, poor: 100, veryPoor: 150, max: 200 } },
  voc: { name: 'Volatile compounds', unit: 'ppb', bands: { moderate: 300, poor: 1000, veryPoor: 3000, max: 4000 } },
};

export type AirQualityTrend = 'rising' | 'falling' | 'steady';

/** Every visible and spoken word, for translation. */
export interface AirQualityLabels {
  good: string;
  moderate: string;
  poor: string;
  'very-poor': string;
  rising: string;
  falling: string;
  steady: string;
  noData: string;
}

export const AIR_QUALITY_LABELS: AirQualityLabels = {
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
  'very-poor': 'Very poor',
  rising: 'Rising',
  falling: 'Falling',
  steady: 'Steady',
  noData: 'No reading',
};

export interface AirQualityOptions {
  /** Default `other`. */
  kind?: AirQualityKind;
  /** What is shown ("Carbon dioxide"); default the kind's name. */
  name?: string;
  value: number | null;
  /** Default the kind's unit. */
  unit?: string;
  /** Default the kind's bands; required for `other`. */
  bands?: AirQualityBands;
  /** Recent readings, oldest first, ending now: drawn as a small line with the direction in words. */
  trend?: readonly (number | null)[];
  /** The span of the trend ("Last 6 hours"), after the direction. */
  trendLabel?: string;
  /** Smaller, for watches and small tiles: the band and line stay, the reading gets smaller. */
  compact?: boolean;
  /** Formats the reading (default whole numbers, one decimal below 10). */
  format?: (value: number) => string;
  labels?: Partial<AirQualityLabels>;
}

export interface AirQualityHandle {
  el: HTMLDivElement;
  /** Replaces everything shown. */
  update(options: AirQualityOptions): void;
}

const FALLBACK: AirQualityPreset = { name: 'Air quality', unit: '', bands: { moderate: 25, poor: 50, veryPoor: 75, max: 100 } };

/** Name, unit and bands for the options, from the kind's preset with the options' overrides. */
export function airQualityPreset(o: Pick<AirQualityOptions, 'kind' | 'name' | 'unit' | 'bands'>): AirQualityPreset {
  const base = o.kind && o.kind !== 'other' ? AIR_QUALITY_PRESETS[o.kind] : FALLBACK;
  return { name: o.name ?? base.name, unit: o.unit ?? base.unit, bands: o.bands ?? base.bands };
}

/** The level a reading falls in. */
export function airQualityLevel(value: number, bands: AirQualityBands): AirQualityLevel {
  if (value >= bands.veryPoor) return 'very-poor';
  if (value >= bands.poor) return 'poor';
  if (value >= bands.moderate) return 'moderate';
  return 'good';
}

/**
 * Which way the readings are going: the newest against the average of the oldest third. A change smaller than 5% of
 * the first band (good) counts as steady. `null` without two readings.
 */
export function airQualityTrend(values: readonly (number | null)[], bands: AirQualityBands): AirQualityTrend | null {
  const known = values.filter(isNum);
  if (known.length < 2) return null;
  const head = known.slice(0, Math.max(1, Math.floor(known.length / 3)));
  const start = head.reduce((a, b) => a + b, 0) / head.length;
  const diff = known[known.length - 1]! - start;
  const still = Math.max(bands.moderate * 0.05, Number.EPSILON);
  if (Math.abs(diff) < still) return 'steady';
  return diff > 0 ? 'rising' : 'falling';
}

/** The default reading format: whole numbers, one decimal below 10. */
export function formatAirQuality(value: number): string {
  return Math.abs(value) < 10 ? String(Number(value.toFixed(1))) : String(Math.round(value));
}

/** The widths of the four zones in percent of the scale, best first. */
export function airQualityZones(bands: AirQualityBands): number[] {
  const max = Math.max(bands.max, bands.veryPoor, 1e-9);
  const edges = [0, bands.moderate, bands.poor, bands.veryPoor, max].map((v) => clampTo(v, 0, max));
  return [0, 1, 2, 3].map((i) => r2(((edges[i + 1]! - edges[i]!) / max) * 100));
}

export function airQualityClass(level: AirQualityLevel | null, compact = false): string {
  return cx('mh-air-quality', level ? `mh-air-quality--${level}` : 'is-empty', compact && 'mh-air-quality--compact');
}

const TREND_ICON: Record<AirQualityTrend, string> = { rising: mdiTrendingUp, falling: mdiTrendingDown, steady: mdiTrendingNeutral };

/**
 * The markup of `.mh-air-quality`: `__head` (`__name`, `__level` word with a dot), `__reading` (`__value`,
 * `__unit`), the `__band` (a `role="meter"` of four `__zone--<level>` parts with the `__marker` at the reading) and
 * the optional `__trend` (`__spark` line, `__direction` with arrow, `__span`). Modifiers `--good | --moderate |
 * --poor | --very-poor`, `--compact`; `.is-empty` without a reading.
 */
export function airQualityTree(o: AirQualityOptions): ChartNode {
  const l = { ...AIR_QUALITY_LABELS, ...o.labels };
  const p = airQualityPreset(o);
  const format = o.format ?? formatAirQuality;
  const has = isNum(o.value);
  const level = has ? airQualityLevel(o.value as number, p.bands) : null;
  const max = Math.max(p.bands.max, p.bands.veryPoor);
  const word = level ? l[level] : l.noData;
  const reading = has ? `${format(o.value as number)}${p.unit ? ` ${p.unit}` : ''}` : l.noData;
  const trend = o.trend && o.trend.length > 1 ? airQualityTrend(o.trend, p.bands) : null;
  const known = (o.trend ?? []).filter(isNum);
  const geo = o.trend && known.length > 1 ? sparklineGeometry(o.trend, Math.min(0, ...known), Math.max(max * 0.5, ...known)) : null;
  return node(
    'div',
    { class: airQualityClass(level, o.compact), role: 'group', 'aria-label': p.name },
    node(
      'div',
      { class: 'mh-air-quality__head' },
      node('span', { class: 'mh-air-quality__name' }, p.name),
      node('span', { class: 'mh-air-quality__level' }, word),
    ),
    node(
      'div',
      { class: 'mh-air-quality__reading', 'aria-hidden': 'true' },
      node('span', { class: 'mh-air-quality__value' }, has ? format(o.value as number) : '–'),
      has && p.unit && node('span', { class: 'mh-air-quality__unit' }, p.unit),
    ),
    node(
      'div',
      {
        class: 'mh-air-quality__band',
        role: 'meter',
        'aria-label': p.name,
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-valuenow': has ? clampTo(o.value as number, 0, max) : undefined,
        'aria-valuetext': has ? `${reading}, ${word}` : l.noData,
      },
      airQualityZones(p.bands).map((w, i) => node('span', { class: `mh-air-quality__zone mh-air-quality__zone--${AIR_QUALITY_LEVELS[i]}`, style: `width: ${w}%` })),
      has && node('span', { class: 'mh-air-quality__marker', style: `left: ${r2((clampTo(o.value as number, 0, max) / max) * 100)}%` }),
    ),
    trend &&
      node(
        'div',
        { class: cx('mh-air-quality__trend', `mh-air-quality__trend--${trend}`) },
        geo &&
          node(
            'svg',
            { class: 'mh-air-quality__spark', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
            node('path', { class: 'mh-air-quality__spark-line', d: geo.line, 'vector-effect': 'non-scaling-stroke' }),
          ),
        node('span', { class: 'mh-air-quality__direction' }, iconTree(TREND_ICON[trend]), l[trend]),
        o.trendLabel && node('span', { class: 'mh-air-quality__span' }, o.trendLabel),
      ),
  );
}

/**
 * `.mh-air-quality`: one air reading (carbon dioxide, particles, volatile compounds or any other) with its level
 * word on a good-to-poor band and the direction of the last readings. Level colours come from the status roles.
 */
export function createAirQuality(options: AirQualityOptions): AirQualityHandle {
  const el = toDom(airQualityTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, airQualityTree(next)) };
}
