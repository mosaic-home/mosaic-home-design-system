import { mdiAccessPoint, mdiAlertOutline, mdiBus, mdiFerry, mdiSubwayVariant, mdiTrain, mdiTram } from '@mdi/js';
import { cx, h } from '../../dom.ts';
import { createIcon } from '../../icons.ts';

export type DepartureMode = 'bus' | 'tram' | 'train' | 'metro' | 'ferry';

/** A categorical colour for the line badge (`--mh-series-1` to `-6`); the accent when absent. */
export type DepartureColor = 1 | 2 | 3 | 4 | 5 | 6;

export interface Departure {
  id: string;
  /** The line's short name ("12", "N4", "Riverside"). */
  line: string;
  mode?: DepartureMode;
  color?: DepartureColor | null;
  destination: string;
  /** "via Market Square". */
  via?: string | null;
  platform?: string | null;
  /** Expected minutes until it leaves, delays included; null when unknown. Departed ones (below 0) are left out. */
  minutes: number | null;
  /** The timetabled time, as given ("08:42"). */
  time?: string | null;
  /** Minutes late (negative: early). */
  delay?: number | null;
  cancelled?: boolean;
  /** The minutes come from live tracking, not the timetable. */
  live?: boolean;
  /** A short message ("Replacement bus", "Last service"). */
  note?: string | null;
}

export interface DeparturesBoardLabels {
  line: string;
  destination: string;
  platform: string;
  departs: string;
  /** Shown when a departure is due. */
  now: string;
  /** The unit after the minutes. */
  min: string;
  /** Spoken for the minutes ("in 5 minutes"). */
  inMinutes: (minutes: number) => string;
  late: (minutes: number) => string;
  early: (minutes: number) => string;
  cancelled: string;
  live: string;
  /** Spoken before the timetabled time. */
  scheduled: string;
  stale: string;
  empty: string;
  more: (count: number) => string;
}

export const DEPARTURES_BOARD_LABELS: DeparturesBoardLabels = {
  line: 'Line',
  destination: 'Destination',
  platform: 'Platform',
  departs: 'Departs',
  now: 'Now',
  min: 'min',
  inMinutes: (m) => (m === 1 ? 'in 1 minute' : `in ${m} minutes`),
  late: (m) => `${m} min late`,
  early: (m) => `${m} min early`,
  cancelled: 'Cancelled',
  live: 'Live',
  scheduled: 'Timetabled',
  stale: 'Live times unavailable, showing the timetable',
  empty: 'No departures soon',
  more: (n) => `${n} more later`,
};

export interface DeparturesBoardOptions {
  /** The stop's name, the board's heading. */
  stop?: string | null;
  departures: readonly Departure[];
  /** Most rows shown (default all). */
  max?: number;
  /** "Updated 08:31", as given. */
  updated?: string | null;
  /** The live feed is down: a warning line, and the minutes read as timetabled. */
  stale?: boolean;
  /** Level of the stop heading (default 3). */
  headingLevel?: 2 | 3 | 4;
  /** Accessible name when there is no `stop` (default "Departures"). */
  label?: string;
  labels?: Partial<DeparturesBoardLabels>;
}

export interface DeparturesBoardHandle {
  el: HTMLElement;
  update(changes: Partial<DeparturesBoardOptions>): void;
}

export interface DeparturesBoardView {
  rows: Departure[];
  hidden: number;
  /** Any row has a platform (the column is shown). */
  platforms: boolean;
}

/** Leaves out departed services, orders by minutes to go (unknown last; ties keep their order) and cuts to `max`. */
export function departuresBoardView(departures: readonly Departure[], max?: number): DeparturesBoardView {
  const ahead = departures.filter((d) => d.minutes === null || d.minutes >= 0);
  const sorted = ahead
    .map((d, i) => ({ d, i }))
    .sort((a, b) => (a.d.minutes ?? Infinity) - (b.d.minutes ?? Infinity) || a.i - b.i)
    .map((x) => x.d);
  const rows = max !== undefined && max >= 0 ? sorted.slice(0, Math.floor(max)) : sorted;
  return {
    rows,
    hidden: sorted.length - rows.length,
    platforms: rows.some((d) => !!d.platform),
  };
}

export const DEPARTURE_MODE_ICONS: Record<DepartureMode, string> = {
  bus: mdiBus,
  tram: mdiTram,
  train: mdiTrain,
  metro: mdiSubwayVariant,
  ferry: mdiFerry,
};
export const DEPARTURE_LIVE_ICON = mdiAccessPoint;
export const DEPARTURE_STALE_ICON = mdiAlertOutline;

export function departureRowClass(d: Departure): string {
  const late = (d.delay ?? 0) > 0;
  return cx('mh-departures-board__row', d.cancelled && 'is-cancelled', !d.cancelled && d.minutes !== null && d.minutes < 1 && 'is-due', !d.cancelled && late && 'is-late');
}

export function departureLineClass(color?: DepartureColor | null): string {
  return cx('mh-departures-board__line-badge', color && `mh-departures-board__line-badge--c${color}`);
}

/** The visible minutes ("5", "Now", "–") and the spoken words for them. */
export function departureWhen(d: Departure, labels: DeparturesBoardLabels): { value: string; unit: string; spoken: string } {
  if (d.minutes === null) return { value: '–', unit: '', spoken: '' };
  const m = Math.floor(d.minutes);
  if (m < 1) return { value: labels.now, unit: '', spoken: labels.now };
  return { value: String(m), unit: labels.min, spoken: labels.inMinutes(m) };
}

/** The delay badge text ("+3", "−1") and its words, or null when on time. */
export function departureDelay(d: Departure, labels: DeparturesBoardLabels): { text: string; spoken: string } | null {
  const v = Math.round(d.delay ?? 0);
  if (!v || d.cancelled) return null;
  return v > 0 ? { text: `+${v}`, spoken: labels.late(v) } : { text: `−${-v}`, spoken: labels.early(-v) };
}

/**
 * `section.mh-departures-board` (`.is-stale`): a `__header` (`__stop` heading, `__updated`), a `__stale` warning,
 * and a `table.__table` with SR-only column headers. Each `tr.__row` (`.is-due`, `.is-late`, `.is-cancelled`) has
 * the `__line` (`__line-badge` `--c1` to `--c6`, mode icon), `__destination` (`__name`, `__via`, `__note`),
 * `__platform` (only when some row has one) and `__departs` (`__minutes` with `__value` and `__unit`, `__live`,
 * `__delay`, `__time`; or `__cancelled`). `__empty` and `__more` after.
 */
export function createDeparturesBoard(options: DeparturesBoardOptions): DeparturesBoardHandle {
  let o: DeparturesBoardOptions = { ...options };
  const el = h('section', {});
  const render = (): void => {
    const labels = { ...DEPARTURES_BOARD_LABELS, ...o.labels };
    const view = departuresBoardView(o.departures, o.max);
    const heading = `h${o.headingLevel ?? 3}` as 'h3';
    el.className = cx('mh-departures-board', o.stale && 'is-stale');
    el.setAttribute('aria-label', o.stop || o.label || 'Departures');
    const th = (text: string, cls: string): HTMLTableCellElement => h('th', { scope: 'col', class: cls }, text);
    const row = (d: Departure): HTMLTableRowElement => {
      const when = departureWhen(d, labels);
      const delay = departureDelay(d, labels);
      const live = d.live && !o.stale && !d.cancelled;
      return h(
        'tr',
        { class: departureRowClass(d), 'data-id': d.id },
        h(
          'td',
          { class: 'mh-departures-board__line' },
          h(
            'span',
            { class: departureLineClass(d.color) },
            d.mode ? createIcon(DEPARTURE_MODE_ICONS[d.mode]) : null,
            h('span', { class: 'mh-departures-board__line-name' }, d.line),
          ),
        ),
        h(
          'td',
          { class: 'mh-departures-board__destination' },
          h('span', { class: 'mh-departures-board__name' }, d.destination),
          d.via ? h('span', { class: 'mh-departures-board__via' }, d.via) : null,
          d.note ? h('span', { class: 'mh-departures-board__note' }, d.note) : null,
        ),
        view.platforms ? h('td', { class: 'mh-departures-board__platform' }, d.platform ?? '') : null,
        h(
          'td',
          { class: 'mh-departures-board__departs' },
          d.cancelled
            ? h('span', { class: 'mh-departures-board__cancelled' }, labels.cancelled)
            : h(
                'span',
                { class: 'mh-departures-board__minutes' },
                live
                  ? createIcon(DEPARTURE_LIVE_ICON, {
                      class: 'mh-departures-board__live',
                      label: labels.live,
                    })
                  : null,
                h(
                  'span',
                  {
                    class: 'mh-departures-board__value',
                    'aria-hidden': when.spoken ? 'true' : null,
                  },
                  when.value,
                ),
                when.unit
                  ? h(
                      'span',
                      {
                        class: 'mh-departures-board__unit',
                        'aria-hidden': 'true',
                      },
                      when.unit,
                    )
                  : null,
                when.spoken ? h('span', { class: 'mh-visually-hidden' }, when.spoken) : null,
              ),
          delay
            ? h('span', { class: 'mh-departures-board__delay' }, h('span', { 'aria-hidden': 'true' }, delay.text), h('span', { class: 'mh-visually-hidden' }, delay.spoken))
            : null,
          d.time ? h('span', { class: 'mh-departures-board__time' }, h('span', { class: 'mh-visually-hidden' }, `${labels.scheduled} `), d.time) : null,
        ),
      );
    };
    const header =
      o.stop || o.updated
        ? h(
            'div',
            { class: 'mh-departures-board__header' },
            o.stop ? h(heading, { class: 'mh-departures-board__stop' }, o.stop) : null,
            o.updated ? h('span', { class: 'mh-departures-board__updated' }, o.updated) : null,
          )
        : null;
    el.replaceChildren(
      ...(header ? [header] : []),
      ...(o.stale ? [h('p', { class: 'mh-departures-board__stale' }, createIcon(DEPARTURE_STALE_ICON), labels.stale)] : []),
      ...(view.rows.length
        ? [
            h(
              'table',
              { class: 'mh-departures-board__table' },
              h(
                'thead',
                { class: 'mh-visually-hidden' },
                h(
                  'tr',
                  {},
                  th(labels.line, 'mh-departures-board__th'),
                  th(labels.destination, 'mh-departures-board__th'),
                  view.platforms ? th(labels.platform, 'mh-departures-board__th') : null,
                  th(labels.departs, 'mh-departures-board__th'),
                ),
              ),
              h('tbody', {}, ...view.rows.map(row)),
            ),
          ]
        : [h('p', { class: 'mh-departures-board__empty' }, labels.empty)]),
      ...(view.hidden ? [h('p', { class: 'mh-departures-board__more' }, labels.more(view.hidden))] : []),
    );
  };
  render();
  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
  };
}
