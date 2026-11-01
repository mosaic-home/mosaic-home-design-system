// Plain calendar dates as ISO strings ('2026-10-16'): no time zone, so a date never shifts by a day. Arithmetic
// runs in UTC; names, order and the first day of the week come from Intl for the given locale.

/** A calendar date, `YYYY-MM-DD`. */
export type IsoDate = string;

/** A start and end date; `end` is null while only the start has been picked. */
export interface DateRange {
  start: IsoDate;
  end: IsoDate | null;
}

/** 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Whether `value` is a real calendar date in `YYYY-MM-DD` form. */
export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string') return false;
  const m = ISO.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]);
}

const pad = (n: number, width = 2): string => String(n).padStart(width, '0');

/** `YYYY-MM-DD` for a year, month (1–12) and day; out-of-range parts roll over. */
export function isoDate(year: number, month: number, day: number): IsoDate {
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(year, month - 1, day);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Year, month (1–12) and day of an ISO date. */
export function dateParts(iso: IsoDate): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return { year: y, month: m, day: d };
}

/** A UTC `Date` at midnight of the ISO date, for Intl formatting with `timeZone: 'UTC'`. */
export function utcDate(iso: IsoDate): Date {
  const { year, month, day } = dateParts(iso);
  const d = new Date(Date.UTC(2000, 0, 1));
  d.setUTCFullYear(year, month - 1, day);
  return d;
}

/** Today in the device's local time zone. */
export function todayIso(now = new Date()): IsoDate {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const { year, month, day } = dateParts(iso);
  return isoDate(year, month, day + days);
}

/** Adds months, keeping the day where it exists (31 January + 1 month is 28 or 29 February). */
export function addMonths(iso: IsoDate, months: number): IsoDate {
  const { year, month, day } = dateParts(iso);
  const first = isoDate(year, month + months, 1);
  const { year: y, month: m } = dateParts(first);
  return isoDate(y, m, Math.min(day, daysInMonth(y, m)));
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Day of the week of an ISO date, 0 = Sunday. */
export function weekdayOf(iso: IsoDate): Weekday {
  return utcDate(iso).getUTCDay() as Weekday;
}

/** The earlier and later of two dates. */
export function orderDates(a: IsoDate, b: IsoDate): [IsoDate, IsoDate] {
  return a <= b ? [a, b] : [b, a];
}

/** Whether `iso` lies inside `[min, max]` (either bound optional). */
export function inBounds(iso: IsoDate, min?: IsoDate | null, max?: IsoDate | null): boolean {
  return (!min || iso >= min) && (!max || iso <= max);
}

/** Clamps a date into `[min, max]`. */
export function clampDate(iso: IsoDate, min?: IsoDate | null, max?: IsoDate | null): IsoDate {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

interface WeekInfoLocale {
  getWeekInfo?: () => { firstDay?: number };
  weekInfo?: { firstDay?: number };
}

/**
 * The first day of the week for a locale, from `Intl.Locale` week info (where the platform has it). Falls back to
 * Monday, the ISO 8601 week start.
 */
export function firstDayOfWeek(locale?: string): Weekday {
  try {
    const loc = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & WeekInfoLocale;
    const info = typeof loc.getWeekInfo === 'function' ? loc.getWeekInfo() : loc.weekInfo;
    const first = info?.firstDay;
    if (typeof first === 'number' && first >= 1 && first <= 7) return (first % 7) as Weekday;
  } catch {
    // An unknown locale tag: use the default below.
  }
  return 1;
}

// 2023-01-01 was a Sunday; the week that follows names every weekday once.
const SUNDAY = '2023-01-01';

/** Weekday names in display order, starting at `weekStart`. */
export function weekdayNames(locale: string | undefined, weekStart: Weekday, style: 'long' | 'short' | 'narrow'): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' });
  return Array.from({ length: 7 }, (_, i) => fmt.format(utcDate(addDays(SUNDAY, (weekStart + i) % 7))));
}

/** "October 2026" for the month of an ISO date. */
export function monthTitle(iso: IsoDate, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utcDate(iso));
}

/** Formats an ISO date for display (default: the locale's medium date style). */
export function formatDate(iso: IsoDate, locale?: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(utcDate(iso));
}

/** Formats a range ("12–18 Oct 2026"), sharing the parts both ends have in common where the platform can. */
export function formatDateRange(start: IsoDate, end: IsoDate, locale?: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  const fmt = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
  if (typeof fmt.formatRange === 'function') return fmt.formatRange(utcDate(start), utcDate(end));
  return `${fmt.format(utcDate(start))} – ${fmt.format(utcDate(end))}`;
}

/** The ISO dates shown in a month grid: whole weeks from the one holding the 1st, six rows. */
export function monthGrid(year: number, month: number, weekStart: Weekday): IsoDate[] {
  const first = isoDate(year, month, 1);
  const lead = (weekdayOf(first) - weekStart + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
