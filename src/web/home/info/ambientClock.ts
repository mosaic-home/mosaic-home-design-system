import { mdiCalendarClock } from '@mdi/js';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { formatTemperature, weatherIcon, weatherIconClass, weatherWord, type WeatherCondition } from '../weather.ts';
import { infoFormatter, infoMs, infoUses12h, type InfoClockFormat, type InfoTime } from './time.ts';

export interface AmbientClockEvent {
  title: string;
  /** When, as given ("18:00", "In 20 min", "Tomorrow 09:00"). */
  when?: string | null;
  icon?: IconName | string;
}

export interface AmbientClockWeather {
  condition: WeatherCondition | null;
  temperature: number | null;
  /** Default "°". */
  unit?: string;
  /** The condition in words (default: the condition's own word). */
  text?: string | null;
}

export interface AmbientClockOptions extends InfoClockFormat {
  /** A fixed time to show. Without one the clock shows the current time and keeps itself up to date. */
  time?: InfoTime;
  /** Show seconds (default false; never at night). */
  seconds?: boolean;
  /** Show the date line (default true). */
  date?: boolean;
  nextEvent?: AmbientClockEvent | null;
  weather?: AmbientClockWeather | null;
  /** The dim look for a dark bedroom: low contrast, no accent, thin figures. */
  night?: boolean;
  /** Moves the content a few pixels now and then so nothing burns into the screen (default true; off when the user asks for reduced motion). */
  drift?: boolean;
  /** Time between drift steps, in ms (default 60 000). */
  driftEvery?: number;
  /** Accessible name (default "Clock"). */
  label?: string;
}

export interface AmbientClockHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. */
  update(changes: Partial<AmbientClockOptions>): void;
  /** Stops the timers. */
  destroy(): void;
}

export interface AmbientClockParts {
  /** Hours and minutes (and seconds), without the day period ("07:42", "7:42"). */
  time: string;
  /** "AM", "PM" or the locale's word; empty in 24-hour time. */
  period: string;
  /** Whether the period comes before the time in this locale. */
  periodFirst: boolean;
  /** "Wednesday 16 October" in the locale's order. */
  date: string;
  /** ISO 8601, for `<time datetime>`. */
  iso: string;
}

/** The pieces of the clock face for a moment, through Intl. */
export function ambientClockParts(t: InfoTime, format: InfoClockFormat = {}, seconds = false): AmbientClockParts {
  const ms = infoMs(t);
  const twelve = infoUses12h(format);
  const parts = infoFormatter(format, {
    hour: twelve ? 'numeric' : '2-digit',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined,
  }).formatToParts(ms);
  const at = parts.findIndex((p) => p.type === 'dayPeriod');
  const period = at >= 0 ? parts[at]!.value : '';
  const firstNumber = parts.findIndex((p) => p.type === 'hour');
  const time = parts
    .filter((p) => p.type !== 'dayPeriod')
    .map((p) => p.value)
    .join('')
    .trim();
  const date = infoFormatter(format, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(ms);
  return {
    time,
    period,
    periodFirst: at >= 0 && at < firstNumber,
    date,
    iso: new Date(ms).toISOString(),
  };
}

/** Drift offset at a step, each axis in −1…1: a slow figure that visits the whole square without jumping. */
export function ambientClockDrift(step: number): { x: number; y: number } {
  const round = (v: number): number => Math.round(v * 1000) / 1000;
  return {
    x: round(Math.sin(step * 0.61)),
    y: round(Math.sin(step * 0.37 + 1.3)),
  };
}

/** Milliseconds until the face next changes (the next minute, or second). */
export function ambientClockNextTick(now: number, seconds: boolean): number {
  const unit = seconds ? 1000 : 60_000;
  return unit - (now % unit) + 5;
}

export function ambientClockClass(o: Pick<AmbientClockOptions, 'night'>): string {
  return cx('mh-ambient-clock', o.night && 'is-night');
}

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const AMBIENT_CLOCK_EVENT_ICON = mdiCalendarClock;

/**
 * `.mh-ambient-clock` (`.is-night`): a screensaver face, centred. `__face` holds a `time.__time` (`__digits` and
 * a smaller `__period` in 12-hour time) and a `__date`; under them `__extras` with the `__event` (`__event-icon`,
 * `__event-title`, `__event-when`) and the `__weather` (`__weather-icon`, `__temperature`, `__condition`). The face
 * drifts by up to a large space step (`--_dx`, `--_dy`) and holds still under reduced motion. Not a live region:
 * a ticking clock would talk all the time.
 */
export function createAmbientClock(options: AmbientClockOptions): AmbientClockHandle {
  let o: AmbientClockOptions = { ...options };
  const digits = h('span', { class: 'mh-ambient-clock__digits' });
  const period = h('span', { class: 'mh-ambient-clock__period' });
  const time = h('time', { class: 'mh-ambient-clock__time' });
  const date = h('div', { class: 'mh-ambient-clock__date' });
  const extras = h('div', { class: 'mh-ambient-clock__extras' });
  const face = h('div', { class: 'mh-ambient-clock__face' }, time);
  const el = h('div', { role: 'group' }, face);
  let tick: ReturnType<typeof setTimeout> | undefined;
  let drift: ReturnType<typeof setInterval> | undefined;
  let step = 0;
  let extrasKey = '';

  const showSeconds = (): boolean => !!o.seconds && !o.night;

  const paint = (): void => {
    const p = ambientClockParts(o.time ?? Date.now(), o, showSeconds());
    digits.textContent = p.time;
    period.textContent = p.period;
    time.dateTime = p.iso;
    time.replaceChildren(...(p.period ? (p.periodFirst ? [period, digits] : [digits, period]) : [digits]));
    date.textContent = p.date;
  };

  const renderExtras = (): void => {
    const key = JSON.stringify([o.nextEvent ?? null, o.weather ?? null]);
    if (key === extrasKey) return;
    extrasKey = key;
    const e = o.nextEvent;
    const w = o.weather;
    extras.replaceChildren(
      ...(e
        ? [
            h(
              'div',
              { class: 'mh-ambient-clock__event' },
              createIcon(e.icon ?? AMBIENT_CLOCK_EVENT_ICON, {
                class: 'mh-ambient-clock__event-icon',
              }),
              e.when ? h('span', { class: 'mh-ambient-clock__event-when' }, e.when) : null,
              h('span', { class: 'mh-ambient-clock__event-title' }, e.title),
            ),
          ]
        : []),
      ...(w
        ? [
            h(
              'div',
              { class: 'mh-ambient-clock__weather' },
              createIcon(weatherIcon(w.condition), {
                class: weatherIconClass(w.condition, 'mh-ambient-clock__weather-icon'),
              }),
              h('span', { class: 'mh-ambient-clock__temperature' }, formatTemperature(w.temperature, w.unit)),
              (w.text ?? weatherWord(w.condition)) ? h('span', { class: 'mh-ambient-clock__condition' }, w.text ?? weatherWord(w.condition)) : null,
            ),
          ]
        : []),
    );
  };

  const schedule = (): void => {
    clearTimeout(tick);
    tick = undefined;
    if (o.time !== undefined) return;
    tick = setTimeout(
      () => {
        paint();
        schedule();
      },
      ambientClockNextTick(Date.now(), showSeconds()),
    );
  };

  const moveTo = (s: number): void => {
    const d = ambientClockDrift(s);
    el.style.setProperty('--_dx', String(d.x));
    el.style.setProperty('--_dy', String(d.y));
  };
  const setDrift = (): void => {
    clearInterval(drift);
    drift = undefined;
    if (o.drift === false || reducedMotion()) {
      el.style.removeProperty('--_dx');
      el.style.removeProperty('--_dy');
      return;
    }
    moveTo(step);
    drift = setInterval(() => moveTo(++step), o.driftEvery ?? 60_000);
  };

  const render = (): void => {
    el.className = ambientClockClass(o);
    el.setAttribute('aria-label', o.label ?? 'Clock');
    paint();
    renderExtras();
    face.replaceChildren(time, ...(o.date === false ? [] : [date]), ...(o.nextEvent || o.weather ? [extras] : []));
  };

  render();
  schedule();
  setDrift();
  return {
    el,
    update(changes) {
      const driftChanged = 'drift' in changes || 'driftEvery' in changes;
      o = { ...o, ...changes };
      render();
      schedule();
      if (driftChanged) setDrift();
    },
    destroy() {
      clearTimeout(tick);
      clearInterval(drift);
      tick = drift = undefined;
    },
  };
}
