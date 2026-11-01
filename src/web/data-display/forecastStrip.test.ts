import { describe, expect, it } from 'vitest';
import { FORECAST_DAYS_MAX, createForecastStrip, forecastItemLabel, type ForecastReading } from './index.ts';

const day = (label: string, extra: Partial<ForecastReading> = {}): ForecastReading => ({ label, condition: 'clear', value: 15, low: 9, ...extra });

describe('forecastItemLabel', () => {
  it('speaks the condition, high, low and the extra line', () => {
    expect(forecastItemLabel({ label: 'Wed', condition: 'rain', value: 15, low: 9, sub: '80%' }, { subName: 'rain' })).toBe('Wed: Rain, high 15°, low 9°, 80% rain');
    expect(forecastItemLabel({ label: 'Wed', condition: 'rain', conditionText: 'Light rain showers', value: 15.2 })).toBe('Wed: Light rain showers, 15°');
    expect(forecastItemLabel({ label: '14:00', condition: null, value: null, low: 3 }, { variant: 'hours', unit: '°C' })).toBe('14:00: no reading');
    expect(forecastItemLabel({ label: '14:00', value: 12, low: 3 }, { variant: 'hours' })).toBe('14:00: 12°');
  });
});

describe('createForecastStrip', () => {
  it('days: a named list of at most seven readings, high and low', () => {
    const readings = Array.from({ length: 9 }, (_, i) => day(`D${i}`, i === 1 ? { state: 'outside', sub: '20%' } : {}));
    const { el } = createForecastStrip({ label: 'Next 7 days', readings });
    expect(el.className).toBe('mh-forecast-strip mh-forecast-strip--days');
    const list = el.querySelector('ul')!;
    expect(list.getAttribute('role')).toBe('list');
    expect(list.getAttribute('aria-label')).toBe('Next 7 days');
    expect(list.hasAttribute('tabindex')).toBe(false);
    expect(list.style.getPropertyValue('--_n')).toBe(String(FORECAST_DAYS_MAX));
    const items = el.querySelectorAll('li');
    expect(items).toHaveLength(FORECAST_DAYS_MAX);
    expect(items[1]!.className).toBe('mh-forecast-strip__item is-outside');
    expect(items[0]!.querySelector('.mh-visually-hidden')!.textContent).toBe('D0: Clear, high 15°, low 9°');
    expect(items[0]!.querySelector('.mh-forecast-strip__low')!.textContent).toBe('9°');
    expect(items[1]!.querySelector('.mh-forecast-strip__sub')!.textContent).toBe('20%');
    expect(items[0]!.querySelector('.mh-forecast-strip__sub')).toBeNull();
    // The visible parts are hidden from screen readers; the sentence speaks for them.
    for (const part of items[0]!.querySelectorAll('.mh-forecast-strip__label, .mh-forecast-strip__value, svg')) expect(part.getAttribute('aria-hidden')).toBe('true');
  });

  it('hours: every reading, focusable for scrolling, no low', () => {
    const readings = Array.from({ length: 12 }, (_, i) => day(`${i}:00`));
    const { el, update } = createForecastStrip({ label: 'Today', readings, variant: 'hours' });
    expect(el.className).toBe('mh-forecast-strip mh-forecast-strip--hours');
    expect(el.querySelector('ul')!.getAttribute('tabindex')).toBe('0');
    expect(el.querySelectorAll('li')).toHaveLength(12);
    expect(el.querySelector('.mh-forecast-strip__low')).toBeNull();
    update({ label: 'Today', readings: readings.slice(0, 2), variant: 'days' });
    expect(el.querySelectorAll('li')).toHaveLength(2);
    expect(el.querySelector('ul')!.hasAttribute('tabindex')).toBe(false);
  });
});
