import { mdiCircleMedium } from '@mdi/js';
import { createButton } from '../../actions/button.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { infoCapitalise, infoClockText, infoDayNumber, infoFormatter, infoMs, type InfoClockFormat, type InfoTime } from './time.ts';

export type ActivityTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface ActivityItem {
  id: string;
  /** What changed ("Back door opened", "Heating set to 21 °C"). */
  title: string;
  /** By what or whom ("Sam", "Morning routine", "Motion in the hall"). */
  by?: string | null;
  time: InfoTime;
  icon?: IconName | string;
  tone?: ActivityTone;
}

export interface ActivityFeedLabels {
  justNow: string;
  /** Spoken before `by`. */
  by: string;
  more: string;
  empty: string;
}

export const ACTIVITY_FEED_LABELS: ActivityFeedLabels = {
  justNow: 'Just now',
  by: 'by',
  more: 'Show older',
  empty: 'Nothing has happened yet',
};

export interface ActivityFeedOptions extends InfoClockFormat {
  items: readonly ActivityItem[];
  /** The time "ago" counts from. Without it the feed uses the clock and refreshes itself every 30 seconds. */
  now?: InfoTime;
  /** Day headings (Today, Yesterday, Monday 14 October); default true. */
  groupByDay?: boolean;
  /** Most entries shown. */
  max?: number;
  /** Level of the day headings (default 3). */
  headingLevel?: 2 | 3 | 4;
  /** Accessible name (default "Activity"). */
  label?: string;
  /** Makes each entry a button. */
  onSelect?: (id: string) => void;
  /** Shows a "Show older" button at the end. */
  onMore?: () => void;
  labels?: Partial<ActivityFeedLabels>;
}

export interface ActivityFeedHandle {
  el: HTMLElement;
  update(changes: Partial<ActivityFeedOptions>): void;
  /** Stops the refresh timer. */
  destroy(): void;
}

export interface ActivityEntryView {
  item: ActivityItem;
  /** "5 minutes ago". */
  ago: string;
  /** The full date and time, for the tooltip. */
  full: string;
  iso: string;
}

export interface ActivityFeedView {
  days: { label: string | null; entries: ActivityEntryView[] }[];
  empty: boolean;
}

/** How long ago, in the locale's words: just now, minutes, hours, then days; a date after a week. */
export function activityAgo(time: InfoTime, now: InfoTime, format: InfoClockFormat = {}, justNow = ACTIVITY_FEED_LABELS.justNow): string {
  const s = (infoMs(now) - infoMs(time)) / 1000;
  if (s < 45) return justNow;
  const rtf = new Intl.RelativeTimeFormat(format.locale, { numeric: 'always' });
  if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), 'minute');
  if (s < 86_400) return rtf.format(-Math.round(s / 3600), 'hour');
  const days = infoDayNumber(now, format) - infoDayNumber(time, format);
  if (days < 7) return infoCapitalise(new Intl.RelativeTimeFormat(format.locale, { numeric: 'auto' }).format(-Math.max(1, days), 'day'), format.locale);
  return infoFormatter(format, { day: 'numeric', month: 'short' }).format(infoMs(time));
}

/** The heading of a day: Today, Yesterday, a weekday this week, else the date. */
export function activityDayLabel(time: InfoTime, now: InfoTime, format: InfoClockFormat = {}): string {
  const days = infoDayNumber(now, format) - infoDayNumber(time, format);
  if (days >= 0 && days < 2) return infoCapitalise(new Intl.RelativeTimeFormat(format.locale, { numeric: 'auto' }).format(-days, 'day'), format.locale);
  if (days >= 0 && days < 7) return infoFormatter(format, { weekday: 'long' }).format(infoMs(time));
  return infoFormatter(format, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(infoMs(time));
}

/** Newest first, cut to `max`, split into days. */
export function activityFeedView(options: ActivityFeedOptions, now: InfoTime): ActivityFeedView {
  const labels = { ...ACTIVITY_FEED_LABELS, ...options.labels };
  const sorted = [...options.items].sort((a, b) => infoMs(b.time) - infoMs(a.time));
  const kept = options.max !== undefined && options.max >= 0 ? sorted.slice(0, Math.floor(options.max)) : sorted;
  const full = infoFormatter(options, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const days: ActivityFeedView['days'] = [];
  let lastDay: number | null = null;
  for (const item of kept) {
    // Under a day heading an earlier day's entry shows its clock time; "Yesterday" twice says nothing.
    const earlier = options.groupByDay !== false && infoDayNumber(item.time, options) < infoDayNumber(now, options);
    const entry: ActivityEntryView = {
      item,
      ago: earlier ? infoClockText(item.time, options) : activityAgo(item.time, now, options, labels.justNow),
      full: full.format(infoMs(item.time)),
      iso: new Date(infoMs(item.time)).toISOString(),
    };
    const day = infoDayNumber(item.time, options);
    if (options.groupByDay === false) {
      if (!days.length) days.push({ label: null, entries: [] });
    } else if (day !== lastDay)
      days.push({
        label: activityDayLabel(item.time, now, options),
        entries: [],
      });
    lastDay = day;
    days[days.length - 1]!.entries.push(entry);
  }
  return { days, empty: kept.length === 0 };
}

export function activityItemClass(tone: ActivityTone = 'neutral'): string {
  return cx('mh-activity-feed__item', tone !== 'neutral' && `mh-activity-feed__item--${tone}`);
}

export const ACTIVITY_DEFAULT_ICON = mdiCircleMedium;

/**
 * `section.mh-activity-feed`: per day a `__day` with a `__day-label` heading and an `ol.__list` of `__item`s
 * (`--accent | --success | --warning | --danger`). Each holds a `__row` (a `div`, or a `button` with `onSelect`)
 * with an `__icon` badge, `__text` (`__title`, `__by`) and a `time.__time` saying how long ago (the clock time
 * under an earlier day's heading), the full time as
 * its tooltip. `__more` and `__empty` at the end.
 */
export function createActivityFeed(options: ActivityFeedOptions): ActivityFeedHandle {
  let o: ActivityFeedOptions = { ...options };
  const el = h('section', { class: 'mh-activity-feed' });
  let timer: ReturnType<typeof setInterval> | undefined;

  const render = (): void => {
    const labels = { ...ACTIVITY_FEED_LABELS, ...o.labels };
    const view = activityFeedView(o, o.now ?? Date.now());
    const heading = `h${o.headingLevel ?? 3}` as 'h3';
    el.setAttribute('aria-label', o.label ?? 'Activity');
    const entry = (e: ActivityEntryView): HTMLLIElement => {
      const content = [
        h('span', { class: 'mh-activity-feed__icon', 'aria-hidden': 'true' }, createIcon(e.item.icon ?? ACTIVITY_DEFAULT_ICON)),
        h(
          'span',
          { class: 'mh-activity-feed__text' },
          h('span', { class: 'mh-activity-feed__title' }, e.item.title),
          e.item.by ? h('span', { class: 'mh-activity-feed__by' }, h('span', { class: 'mh-visually-hidden' }, `${labels.by} `), e.item.by) : null,
        ),
        h('time', { class: 'mh-activity-feed__time', datetime: e.iso, title: e.full }, e.ago),
      ];
      const select = o.onSelect;
      const row = select
        ? h(
            'button',
            {
              type: 'button',
              class: 'mh-activity-feed__row mh-activity-feed__row--button',
              onclick: () => select(e.item.id),
            },
            ...content,
          )
        : h('div', { class: 'mh-activity-feed__row' }, ...content);
      return h('li', { class: activityItemClass(e.item.tone), 'data-id': e.item.id }, row);
    };
    const more = o.onMore
      ? createButton({
          label: labels.more,
          variant: 'text',
          size: 'small',
          onClick: () => o.onMore?.(),
        }).el
      : null;
    more?.classList.add('mh-activity-feed__more');
    el.replaceChildren(
      ...view.days.map((d) =>
        h(
          'div',
          { class: 'mh-activity-feed__day' },
          d.label ? h(heading, { class: 'mh-activity-feed__day-label' }, d.label) : null,
          h('ol', { class: 'mh-activity-feed__list', role: 'list' }, ...d.entries.map(entry)),
        ),
      ),
      ...(view.empty ? [h('p', { class: 'mh-activity-feed__empty' }, labels.empty)] : []),
      ...(more ? [more] : []),
    );
  };

  // A tick rewrites only the "ago" texts while the days stay the same, so a focused row keeps its focus.
  const tick = (): void => {
    const view = activityFeedView(o, Date.now());
    const labels = [...el.querySelectorAll('.mh-activity-feed__day-label')].map((n) => n.textContent);
    if (view.days.some((d, i) => d.label !== null && d.label !== labels[i])) return render();
    const times = el.querySelectorAll('.mh-activity-feed__time');
    view.days
      .flatMap((d) => d.entries)
      .forEach((e, i) => {
        const t = times[i];
        if (t && t.textContent !== e.ago) t.textContent = e.ago;
      });
  };
  const refresh = (): void => {
    clearInterval(timer);
    timer = o.now === undefined ? setInterval(tick, 30_000) : undefined;
  };

  render();
  refresh();
  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
      refresh();
    },
    destroy() {
      clearInterval(timer);
      timer = undefined;
    },
  };
}
