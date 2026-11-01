// A small, generic weather vocabulary shared by `weather-now` and `forecast-strip`: condition ids, their icons and
// English words, a tint per condition, and a keyword mapping from a forecast source's own words.

import * as mdi from '@mdi/js';
import { cx } from '../dom.ts';

export const WEATHER_CONDITIONS = [
  'clear',
  'clear-night',
  'partly-cloudy',
  'cloudy',
  'fog',
  'rain',
  'pouring',
  'snow',
  'sleet',
  'hail',
  'lightning',
  'lightning-rain',
  'wind',
  'exceptional',
] as const;

export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];

/** How a condition's icon is tinted: `sun` warm, `wet` and `ice` cool, `storm` warning, `alert` danger, `plain` muted. */
export type WeatherTint = 'sun' | 'night' | 'plain' | 'wet' | 'ice' | 'storm' | 'alert';

const ICON: Record<WeatherCondition, string> = {
  clear: mdi.mdiWeatherSunny,
  'clear-night': mdi.mdiWeatherNight,
  'partly-cloudy': mdi.mdiWeatherPartlyCloudy,
  cloudy: mdi.mdiWeatherCloudy,
  fog: mdi.mdiWeatherFog,
  rain: mdi.mdiWeatherRainy,
  pouring: mdi.mdiWeatherPouring,
  snow: mdi.mdiWeatherSnowy,
  sleet: mdi.mdiWeatherSnowyRainy,
  hail: mdi.mdiWeatherHail,
  lightning: mdi.mdiWeatherLightning,
  'lightning-rain': mdi.mdiWeatherLightningRainy,
  wind: mdi.mdiWeatherWindy,
  exceptional: mdi.mdiWeatherCloudyAlert,
};

const WORD: Record<WeatherCondition, string> = {
  clear: 'Clear',
  'clear-night': 'Clear',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Fog',
  rain: 'Rain',
  pouring: 'Heavy rain',
  snow: 'Snow',
  sleet: 'Sleet',
  hail: 'Hail',
  lightning: 'Thunder',
  'lightning-rain': 'Thunderstorms',
  wind: 'Windy',
  exceptional: 'Severe weather',
};

const TINT: Record<WeatherCondition, WeatherTint> = {
  clear: 'sun',
  'clear-night': 'night',
  'partly-cloudy': 'sun',
  cloudy: 'plain',
  fog: 'plain',
  rain: 'wet',
  pouring: 'wet',
  snow: 'ice',
  sleet: 'ice',
  hail: 'ice',
  lightning: 'storm',
  'lightning-rain': 'storm',
  wind: 'plain',
  exceptional: 'alert',
};

/** Shown when the condition is unknown. */
export const WEATHER_UNKNOWN_ICON = mdi.mdiCloudQuestionOutline;

export function isWeatherCondition(value: unknown): value is WeatherCondition {
  return typeof value === 'string' && (WEATHER_CONDITIONS as readonly string[]).includes(value);
}

/** The icon path (MDI) for a condition; a cloud with a question mark when unknown. */
export function weatherIcon(condition: WeatherCondition | null | undefined): string {
  return condition ? ICON[condition] : WEATHER_UNKNOWN_ICON;
}

/** The English word for a condition ("Partly cloudy"), or '' when unknown. */
export function weatherWord(condition: WeatherCondition | null | undefined): string {
  return condition ? WORD[condition] : '';
}

export function weatherTint(condition: WeatherCondition | null | undefined): WeatherTint {
  return condition ? TINT[condition] : 'plain';
}

/** Classes of a condition icon: `.mh-weather-icon` and `--<tint>`. */
export function weatherIconClass(condition: WeatherCondition | null | undefined, extra?: string): string {
  return cx('mh-weather-icon', `mh-weather-icon--${weatherTint(condition)}`, extra);
}

export interface WeatherTextOptions {
  /** Map "clear" to `clear-night`. */
  night?: boolean;
}

// Keyword rules, most specific first: the first rule with a matching pattern wins. Each pattern is matched against
// the lower-cased text with word boundaries where a short word could hide inside another.
const RULES: readonly (readonly [RegExp, WeatherCondition])[] = [
  [/\b(tornado|hurricane|typhoon|cyclone|funnel|sand ?storm|dust ?storm|volcanic)\b/, 'exceptional'],
  [/\b(thunder ?storms?|t-?storms?|thundery (rain|showers?))\b/, 'lightning-rain'],
  [/\b(thunder|lightning)\b.*\b(rain|showers?|drizzle)\b|\b(rain|showers?)\b.*\b(thunder|lightning)\b/, 'lightning-rain'],
  [/\b(thunder|lightning)\b/, 'lightning'],
  [/\bhail/, 'hail'],
  [/\b(sleet|freezing (rain|drizzle)|ice pellets|wintry|rain and snow|snow and rain|mixed precipitation)\b/, 'sleet'],
  [/\b(snow|snowy|flurr(y|ies)|blizzard|snowfall)\b/, 'snow'],
  [/\b(heavy|torrential|intense) (rain|showers?)\b|\b(pouring|downpours?|cloudburst)\b/, 'pouring'],
  [/\b(rain|rainy|showers?|drizzle|sprinkles?)\b/, 'rain'],
  [/\b(fog|foggy|mist|misty|haze|hazy|smoke|smoky)\b/, 'fog'],
  [/\b(wind|windy|breezy|blustery|gusts?|gusty|gales?)\b/, 'wind'],
  [/\b(partly|mostly sunny|mostly clear|mostly fair|few clouds|scattered clouds|sunny (intervals|spells)|bright spells|sun and clouds?|variable clouds?)\b/, 'partly-cloudy'],
  [/\b(overcast|cloudy|clouds?|grey|gray|dull)\b/, 'cloudy'],
  [/\b(clear|sunny|sunshine|fair|fine|bright)\b/, 'clear'],
];

/**
 * Maps a forecast source's own words ("Light rain showers", "Mostly sunny", "Thunderstorms", "Overcast", "Mist") to
 * the vocabulary with keyword rules; null when nothing matches.
 */
export function weatherConditionFromText(text: string | null | undefined, options: WeatherTextOptions = {}): WeatherCondition | null {
  const t = (text ?? '').toLowerCase().replace(/_/g, ' ').trim();
  if (!t) return null;
  if (isWeatherCondition(t)) return t === 'clear' && options.night ? 'clear-night' : t;
  for (const [pattern, condition] of RULES) {
    if (!pattern.test(t)) continue;
    return condition === 'clear' && (options.night || /\bnight\b/.test(t)) ? 'clear-night' : condition;
  }
  return null;
}

/** "12°" from a number and a unit; "–" when there is no value. Rounds to whole degrees. */
export function formatTemperature(value: number | null | undefined, unit = '°'): string {
  return value === null || value === undefined || !Number.isFinite(value) ? '–' : `${Math.round(value)}${unit}`;
}
