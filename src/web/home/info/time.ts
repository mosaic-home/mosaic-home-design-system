// Time helpers shared by the information screens (clock, timeline, feed). Formatting goes through Intl, so the
// locale decides the words, the order and 12 or 24 hours unless the caller asks for one.

/** A moment: epoch milliseconds or a Date. */
export type InfoTime = number | Date;

export interface InfoClockFormat {
  /** BCP 47 locale (default: the runtime's). */
  locale?: string;
  /** Force 12-hour (true) or 24-hour (false) time; the locale decides when absent. */
  hour12?: boolean;
  /** IANA time zone (default: the runtime's). */
  timeZone?: string;
}

export const infoMs = (t: InfoTime): number => (typeof t === 'number' ? t : t.getTime());

const cache = new Map<string, Intl.DateTimeFormat>();

/** A cached `Intl.DateTimeFormat`. */
export function infoFormatter(format: InfoClockFormat, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify([format.locale ?? '', format.timeZone ?? '', format.hour12 ?? null, options]);
  let f = cache.get(key);
  if (!f) {
    const o: Intl.DateTimeFormatOptions = {
      ...options,
      timeZone: format.timeZone,
    };
    if (format.hour12 !== undefined && (options.hour !== undefined || options.timeStyle !== undefined)) o.hour12 = format.hour12;
    f = new Intl.DateTimeFormat(format.locale, o);
    cache.set(key, f);
  }
  return f;
}

/** Whether the time reads in 12-hour form for this locale and choice. */
export function infoUses12h(format: InfoClockFormat): boolean {
  if (format.hour12 !== undefined) return format.hour12;
  const cycle = infoFormatter(format, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12';
}

/** Hours and minutes (and seconds) as the locale writes them, day period included ("07:42", "7:42 AM"). */
export function infoClockText(t: InfoTime, format: InfoClockFormat = {}, seconds = false): string {
  const hour = infoUses12h(format) ? 'numeric' : '2-digit';
  return infoFormatter(format, {
    hour,
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined,
  }).format(infoMs(t));
}

/** Year, month and day of a moment in the format's time zone, as a UTC day number (days since the epoch). */
export function infoDayNumber(t: InfoTime, format: InfoClockFormat = {}): number {
  const parts = infoFormatter({ timeZone: format.timeZone }, { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(infoMs(t));
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return Math.round(Date.UTC(get('year'), get('month') - 1, get('day')) / 86_400_000);
}

/** Minutes the time zone is ahead of UTC at a moment (60 for UTC+1). */
export function infoZoneOffset(t: InfoTime, timeZone?: string): number {
  const ms = infoMs(t);
  const parts = infoFormatter(
    { timeZone, locale: 'en-US' },
    {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    },
  ).formatToParts(ms);
  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wall = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return Math.round((wall - (ms - (ms % 1000))) / 60_000);
}

/** Upper-cases the first letter, the locale's way ("yesterday" → "Yesterday"). */
export function infoCapitalise(text: string, locale?: string): string {
  return text ? text.charAt(0).toLocaleUpperCase(locale) + text.slice(1) : text;
}
