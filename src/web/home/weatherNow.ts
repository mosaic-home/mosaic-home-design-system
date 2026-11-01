import { append, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { formatTemperature, weatherIcon, weatherIconClass, weatherWord, type WeatherCondition } from './weather.ts';

export interface WeatherNowOptions {
  condition: WeatherCondition | null;
  temperature: number | null;
  /** Appended to the temperature (default "°"). */
  unit?: string;
  /** The source's own words ("Light rain showers"), shown instead of the generic word. */
  text?: string | null;
  /** A detail line ("Feels 9° · 5% rain"). */
  detail?: string | null;
  /** Where ("Hillside"), shown above. */
  place?: string | null;
}

export interface WeatherNowHandle {
  el: HTMLDivElement;
  update(options: WeatherNowOptions): void;
}

/** The words a weather-now shows: the source's own text, else the generic word. */
export function weatherNowText(options: Pick<WeatherNowOptions, 'condition' | 'text'>): string {
  return options.text?.trim() || weatherWord(options.condition);
}

/**
 * `.mh-weather-now`: the current weather. An optional `__place` above; a tinted condition icon
 * (`.mh-weather-icon`, decorative: the words say it), the `__temperature`, and `__condition` and `__detail` lines.
 */
export function createWeatherNow(options: WeatherNowOptions): WeatherNowHandle {
  const el = h('div', { class: 'mh-weather-now' });
  const update = (next: WeatherNowOptions): void => {
    const word = weatherNowText(next);
    const place = next.place?.trim();
    const detail = next.detail?.trim();
    el.replaceChildren();
    append(
      el,
      place ? h('div', { class: 'mh-weather-now__place' }, place) : null,
      h(
        'div',
        { class: 'mh-weather-now__reading' },
        createIcon(weatherIcon(next.condition), { class: weatherIconClass(next.condition, 'mh-weather-now__icon') }),
        h('div', { class: 'mh-weather-now__temperature' }, formatTemperature(next.temperature, next.unit)),
      ),
      h(
        'div',
        { class: 'mh-weather-now__text' },
        word ? h('div', { class: 'mh-weather-now__condition' }, word) : null,
        detail ? h('div', { class: 'mh-weather-now__detail' }, detail) : null,
      ),
    );
  };
  update(options);
  return { el, update };
}
