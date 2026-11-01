import { describe, expect, it } from 'vitest';
import { WEATHER_CONDITIONS, WEATHER_UNKNOWN_ICON, createWeatherNow, formatTemperature, weatherConditionFromText, weatherIcon, weatherIconClass, weatherWord } from './index.ts';

describe('weather vocabulary', () => {
  it('has an icon and a word for every condition', () => {
    for (const c of WEATHER_CONDITIONS) {
      expect(weatherIcon(c), c).toMatch(/^M/);
      expect(weatherIcon(c)).not.toBe(WEATHER_UNKNOWN_ICON);
      expect(weatherWord(c), c).not.toBe('');
    }
    expect(weatherIcon(null)).toBe(WEATHER_UNKNOWN_ICON);
    expect(weatherWord(undefined)).toBe('');
  });

  it('tints sun warm and rain cool', () => {
    expect(weatherIconClass('clear')).toBe('mh-weather-icon mh-weather-icon--sun');
    expect(weatherIconClass('rain', 'x')).toBe('mh-weather-icon mh-weather-icon--wet x');
    expect(weatherIconClass('snow')).toContain('--ice');
    expect(weatherIconClass('exceptional')).toContain('--alert');
    expect(weatherIconClass(null)).toContain('--plain');
  });

  it('maps free words to the vocabulary', () => {
    const cases: [string, string | null][] = [
      ['Light rain showers', 'rain'],
      ['Mostly sunny', 'partly-cloudy'],
      ['Partly cloudy', 'partly-cloudy'],
      ['Mostly cloudy', 'cloudy'],
      ['Thunderstorms', 'lightning-rain'],
      ['Thunder', 'lightning'],
      ['Rain with thunder', 'lightning-rain'],
      ['Overcast', 'cloudy'],
      ['Mist', 'fog'],
      ['Haze', 'fog'],
      ['Heavy rain', 'pouring'],
      ['Drizzle', 'rain'],
      ['Snow flurries', 'snow'],
      ['Sleet', 'sleet'],
      ['Rain and snow', 'sleet'],
      ['Freezing drizzle', 'sleet'],
      ['Hail showers', 'hail'],
      ['Windy', 'wind'],
      ['Gale-force winds', 'wind'],
      ['Tornado warning', 'exceptional'],
      ['Sunny', 'clear'],
      ['Clear', 'clear'],
      ['Clear night', 'clear-night'],
      ['partly_cloudy', 'partly-cloudy'],
      ['lightning-rain', 'lightning-rain'],
      ['Sunny intervals', 'partly-cloudy'],
      ['', null],
      ['Pleasant', null],
    ];
    for (const [text, want] of cases) expect(weatherConditionFromText(text), text).toBe(want);
    expect(weatherConditionFromText('Clear', { night: true })).toBe('clear-night');
    expect(weatherConditionFromText(null)).toBeNull();
  });

  it('formats temperatures', () => {
    expect(formatTemperature(14.4)).toBe('14°');
    expect(formatTemperature(-2.6, '°C')).toBe('-3°C');
    expect(formatTemperature(null)).toBe('–');
    expect(formatTemperature(Number.NaN)).toBe('–');
  });
});

describe('createWeatherNow', () => {
  it('shows the source’s words instead of the generic word, with place and detail', () => {
    const { el, update } = createWeatherNow({ condition: 'rain', temperature: 9, text: 'Light rain showers', detail: 'Feels 6°', place: 'Hillside' });
    expect(el.className).toBe('mh-weather-now');
    expect(el.querySelector('.mh-weather-now__place')!.textContent).toBe('Hillside');
    expect(el.querySelector('.mh-weather-now__temperature')!.textContent).toBe('9°');
    expect(el.querySelector('.mh-weather-now__condition')!.textContent).toBe('Light rain showers');
    expect(el.querySelector('.mh-weather-now__detail')!.textContent).toBe('Feels 6°');
    const icon = el.querySelector('svg')!;
    expect(icon.getAttribute('class')).toBe('mh-icon mh-weather-icon mh-weather-icon--wet mh-weather-now__icon');
    expect(icon.getAttribute('aria-hidden')).toBe('true');

    update({ condition: 'partly-cloudy', temperature: null });
    expect(el.querySelector('.mh-weather-now__place')).toBeNull();
    expect(el.querySelector('.mh-weather-now__detail')).toBeNull();
    expect(el.querySelector('.mh-weather-now__condition')!.textContent).toBe('Partly cloudy');
    expect(el.querySelector('.mh-weather-now__temperature')!.textContent).toBe('–');

    update({ condition: null, temperature: 3 });
    expect(el.querySelector('.mh-weather-now__condition')).toBeNull();
  });
});
