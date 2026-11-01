import { cx, h } from '../dom.ts';

/** An index into the theme's categorical palette (`--mh-series-1` to `-6`). */
export type AgendaColor = 1 | 2 | 3 | 4 | 5 | 6;

export interface AgendaEvent {
  /** Start ("09:30"), or null for an all-day event. */
  time: string | null;
  /** End ("10:15"). */
  end?: string | null;
  title: string;
  location?: string | null;
  /** Categorical colour; the accent when absent. */
  color?: AgendaColor | null;
}

export interface AgendaDay {
  /** "Today", "Wed 16 Oct". */
  label: string;
  events: readonly AgendaEvent[];
}

export interface AgendaLabels {
  /** Spoken before an all-day event's title. */
  allDay: string;
  /** Spoken between start and end. */
  to: string;
  /** The line under a cut-off list. */
  more: (count: number) => string;
}

export const AGENDA_LABELS: AgendaLabels = {
  allDay: 'All day',
  to: 'to',
  more: (count) => `${count} more`,
};

export interface AgendaOptions {
  days: readonly AgendaDay[];
  /** Shown when there are no events (default "Nothing planned"). */
  empty?: string;
  /** Most events shown, counted in display order; the rest are summed up in a "n more" line. */
  max?: number;
  /** Level of the day headings (default 3). */
  headingLevel?: 2 | 3 | 4;
  labels?: Partial<AgendaLabels>;
}

export interface AgendaHandle {
  el: HTMLDivElement;
  update(options: AgendaOptions): void;
}

export interface AgendaDayView {
  label: string;
  allDay: AgendaEvent[];
  timed: AgendaEvent[];
}

export interface AgendaView {
  days: AgendaDayView[];
  /** Events left out by `max`. */
  hidden: number;
}

/** Days in order, all-day events first in each, cut to `max` events; days left without events are dropped. */
export function agendaView(days: readonly AgendaDay[], max?: number): AgendaView {
  let room = max !== undefined && max >= 0 && Number.isFinite(max) ? Math.floor(max) : Infinity;
  let hidden = 0;
  const out: AgendaDayView[] = [];
  for (const day of days) {
    const ordered = [...day.events.filter((e) => e.time === null), ...day.events.filter((e) => e.time !== null)];
    const kept = ordered.slice(0, Math.max(0, Math.min(room, ordered.length)));
    hidden += ordered.length - kept.length;
    room -= kept.length;
    if (kept.length) out.push({ label: day.label, allDay: kept.filter((e) => e.time === null), timed: kept.filter((e) => e.time !== null) });
  }
  return { days: out, hidden };
}

const colorClass = (block: string, color: AgendaColor | null | undefined): string | false => !!color && `${block}--c${color}`;

export function agendaChipClass(color?: AgendaColor | null): string {
  return cx('mh-agenda__chip', colorClass('mh-agenda__chip', color));
}

export function agendaEventClass(color?: AgendaColor | null): string {
  return cx('mh-agenda__event', colorClass('mh-agenda__event', color));
}

/**
 * `.mh-agenda`: upcoming events grouped by day. Each `__day` has a `__day-label` heading, then all-day events as
 * `__chips` (`__chip`, `--c1` to `--c6`) and timed events as `__events` rows (`__event`, `--c1` to `--c6`) with a
 * coloured `__bar`, a `__time` (`__start`, `__end`) and `__body` (`__title`, `__location`). `__empty` when there
 * is nothing, `__more` when `max` cut the list.
 */
export function createAgenda(options: AgendaOptions): AgendaHandle {
  const el = h('div', { class: 'mh-agenda' });
  const update = (next: AgendaOptions): void => {
    const labels = { ...AGENDA_LABELS, ...next.labels };
    const view = agendaView(next.days, next.max);
    const heading = `h${next.headingLevel ?? 3}` as 'h2' | 'h3' | 'h4';
    const days = view.days.map((day) =>
      h(
        'div',
        { class: 'mh-agenda__day' },
        h(heading, { class: 'mh-agenda__day-label' }, day.label),
        day.allDay.length
          ? h(
              'ul',
              { class: 'mh-agenda__chips', role: 'list' },
              ...day.allDay.map((e) => h('li', { class: agendaChipClass(e.color) }, h('span', { class: 'mh-visually-hidden' }, `${labels.allDay}: `), e.title)),
            )
          : null,
        day.timed.length
          ? h(
              'ul',
              { class: 'mh-agenda__events', role: 'list' },
              ...day.timed.map((e) =>
                h(
                  'li',
                  { class: agendaEventClass(e.color) },
                  h('span', { class: 'mh-agenda__bar', 'aria-hidden': 'true' }),
                  h(
                    'span',
                    { class: 'mh-agenda__time' },
                    h('span', { class: 'mh-agenda__start' }, e.time ?? ''),
                    e.end ? h('span', { class: 'mh-visually-hidden' }, ` ${labels.to} `) : null,
                    e.end ? h('span', { class: 'mh-agenda__end' }, e.end) : null,
                  ),
                  h(
                    'span',
                    { class: 'mh-agenda__body' },
                    h('span', { class: 'mh-agenda__title' }, e.title),
                    e.location ? h('span', { class: 'mh-agenda__location' }, e.location) : null,
                  ),
                ),
              ),
            )
          : null,
      ),
    );
    el.replaceChildren(
      ...days,
      ...(days.length ? [] : [h('p', { class: 'mh-agenda__empty' }, next.empty ?? 'Nothing planned')]),
      ...(view.hidden ? [h('p', { class: 'mh-agenda__more' }, labels.more(view.hidden))] : []),
    );
  };
  update(options);
  return { el, update };
}
