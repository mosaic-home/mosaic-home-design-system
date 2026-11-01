import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { infoClockText, infoMs, infoZoneOffset, type InfoClockFormat, type InfoTime } from './time.ts';

/** A categorical colour (`--mh-series-1` to `-6`), or `accent` (the default). */
export type StateTimelineColor = 1 | 2 | 3 | 4 | 5 | 6 | 'accent';

export interface StateTimelineSpan {
  from: InfoTime;
  /** Null while it still holds (drawn up to `now`, or the end of the window). */
  to: InfoTime | null;
  /** The state in words ("On", "Open", "Home"); default the row's `state`. */
  state?: string;
  color?: StateTimelineColor;
}

export interface StateTimelineRow {
  id?: string;
  /** The thing ("Hall light", "Back door", "Sam"). */
  label: string;
  icon?: IconName | string;
  /** The word for its spans when they have none of their own (default "On"). */
  state?: string;
  color?: StateTimelineColor;
  spans: readonly StateTimelineSpan[];
}

export interface StateTimelineLabels {
  /** Spoken between a span's start and end. */
  to: string;
  /** Spoken for a span that still holds ("until now"). */
  ongoing: string;
  /** Spoken for a span that began before the window. */
  before: string;
  /** Default state word. */
  on: string;
  /** Spoken for a row with no spans. */
  none: string;
}

export const STATE_TIMELINE_LABELS: StateTimelineLabels = {
  to: 'to',
  ongoing: 'until now',
  before: 'since before',
  on: 'On',
  none: 'Not at all',
};

export interface StateTimelineOptions extends InfoClockFormat {
  rows: readonly StateTimelineRow[];
  /** The window shown on the axis. */
  start: InfoTime;
  end: InfoTime;
  /** The current time: open spans end here and a marker is drawn when it falls inside the window. */
  now?: InfoTime | null;
  /** About how many axis labels to aim for (default 4). */
  ticks?: number;
  /** Accessible name (default "Timeline"). */
  label?: string;
  labels?: Partial<StateTimelineLabels>;
}

export interface StateTimelineHandle {
  el: HTMLDivElement;
  update(changes: Partial<StateTimelineOptions>): void;
}

export interface StateTimelineSegment {
  /** Start and length as fractions of the window (0…1). */
  left: number;
  width: number;
  /** Began before the window / runs past its end or still holds (no rounded corner on that side). */
  openStart: boolean;
  openEnd: boolean;
  color: StateTimelineColor;
  /** "On, 07:10 to 08:30". */
  text: string;
}

export interface StateTimelineView {
  rows: {
    label: string;
    icon?: IconName | string;
    segments: StateTimelineSegment[];
  }[];
  ticks: { at: number; label: string }[];
  /** Fraction of the window, or null when now is outside it. */
  now: number | null;
}

const STEPS_MIN = [5, 10, 15, 30, 60, 120, 180, 240, 360, 720, 1440];

/** Axis steps on round local times ("06:00", "12:00"), about `count` of them inside the window. */
export function stateTimelineTicks(start: number, end: number, format: InfoClockFormat = {}, count = 4): { at: number; label: string }[] {
  const range = end - start;
  if (!(range > 0)) return [];
  const want = range / 60_000 / Math.max(1, count);
  const step = (STEPS_MIN.find((s) => s >= want) ?? 1440) * 60_000;
  const offset = infoZoneOffset(start, format.timeZone) * 60_000;
  const first = Math.ceil((start + offset) / step) * step - offset;
  const out: { at: number; label: string }[] = [];
  for (let t = first; t <= end && out.length < 50; t += step) out.push({ at: (t - start) / range, label: infoClockText(t, format) });
  return out;
}

/** Clips the spans to the window, places them and words them. */
export function stateTimelineView(options: StateTimelineOptions): StateTimelineView {
  const labels = { ...STATE_TIMELINE_LABELS, ...options.labels };
  const start = infoMs(options.start);
  const end = infoMs(options.end);
  const range = end - start;
  const now = options.now === undefined || options.now === null ? null : infoMs(options.now);
  const until = now !== null ? Math.min(now, end) : end;
  const clock = (t: number): string => infoClockText(t, options);
  const rows = options.rows.map((row) => ({
    label: row.label,
    icon: row.icon,
    segments:
      range > 0
        ? row.spans.flatMap((span): StateTimelineSegment[] => {
            const from = infoMs(span.from);
            const to = span.to === null ? until : infoMs(span.to);
            const a = Math.max(from, start);
            const b = Math.min(to, end);
            if (!(b > a)) return [];
            const word = span.state ?? row.state ?? labels.on;
            const head = from < start ? `${labels.before} ${clock(start)}` : clock(from);
            const tail = span.to === null ? labels.ongoing : `${labels.to} ${clock(to)}`;
            return [
              {
                left: (a - start) / range,
                width: (b - a) / range,
                openStart: from < start,
                openEnd: span.to === null || to > end,
                color: span.color ?? row.color ?? 'accent',
                text: `${word}, ${head} ${tail}`,
              },
            ];
          })
        : [],
  }));
  return {
    rows,
    ticks: stateTimelineTicks(start, end, options, options.ticks),
    now: now !== null && now >= start && now <= end && range > 0 ? (now - start) / range : null,
  };
}

export function stateTimelineSpanClass(s: Pick<StateTimelineSegment, 'color' | 'openStart' | 'openEnd'>): string {
  return cx('mh-state-timeline__span', s.color !== 'accent' && `mh-state-timeline__span--c${s.color}`, s.openStart && 'is-open-start', s.openEnd && 'is-open-end');
}

/** Inline style of an axis label: its place, and how far it shifts back so the first and last stay inside the axis. */
export const stateTimelineTickStyle = (fraction: number): string => `--_at: ${stateTimelinePercent(fraction)}; --_k: ${Math.round(fraction * 1000) / 1000}`;

/** Percent text for inline custom properties. */
export const stateTimelinePercent = (fraction: number): string => `${Math.round(fraction * 100_000) / 1000}%`;

/**
 * `.mh-state-timeline`: one `__row` per thing in a `__rows` list, each with a `__label` (`__icon`, `__name`) and a
 * `__track` holding `__span` bars (`--c1` to `--c6`, `.is-open-start`, `.is-open-end`; placed by `--_from` and
 * `--_len`) and the `__now` line; under them a shared `__axis` (its `__scale` holds the `__tick`s). Each span's words ("On, 07:10 to
 * 08:30") are its tooltip and its screen-reader text; the drawing itself is hidden from them.
 */
export function createStateTimeline(options: StateTimelineOptions): StateTimelineHandle {
  let o: StateTimelineOptions = { ...options };
  const el = h('div', { class: 'mh-state-timeline', role: 'group' });
  const render = (): void => {
    const labels = { ...STATE_TIMELINE_LABELS, ...o.labels };
    const view = stateTimelineView(o);
    el.setAttribute('aria-label', o.label ?? 'Timeline');
    const nowLine = (): HTMLElement | null =>
      view.now === null
        ? null
        : h('span', {
            class: 'mh-state-timeline__now',
            'aria-hidden': 'true',
            style: `--_at: ${stateTimelinePercent(view.now)}`,
          });
    el.replaceChildren(
      h(
        'ul',
        { class: 'mh-state-timeline__rows', role: 'list' },
        ...view.rows.map((row) =>
          h(
            'li',
            { class: 'mh-state-timeline__row' },
            h(
              'span',
              { class: 'mh-state-timeline__label' },
              row.icon ? createIcon(row.icon, { class: 'mh-state-timeline__icon' }) : null,
              h('span', { class: 'mh-state-timeline__name' }, row.label),
            ),
            h(
              'span',
              { class: 'mh-state-timeline__track' },
              ...row.segments.map((s) =>
                h(
                  'span',
                  {
                    class: stateTimelineSpanClass(s),
                    title: s.text,
                    style: `--_from: ${stateTimelinePercent(s.left)}; --_len: ${stateTimelinePercent(s.width)}`,
                  },
                  h('span', { class: 'mh-visually-hidden' }, s.text),
                ),
              ),
              row.segments.length ? null : h('span', { class: 'mh-visually-hidden' }, labels.none),
              nowLine(),
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'mh-state-timeline__axis', 'aria-hidden': 'true' },
        h(
          'span',
          { class: 'mh-state-timeline__scale' },
          ...view.ticks.map((t) =>
            h(
              'span',
              {
                class: 'mh-state-timeline__tick',
                style: stateTimelineTickStyle(t.at),
              },
              t.label,
            ),
          ),
        ),
      ),
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
