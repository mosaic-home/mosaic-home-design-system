import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type TimelineTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
/** `list`: compact rows with a time column. `feed`: a vertical line with a dot or icon per entry. */
export type TimelineVariant = 'list' | 'feed';

export interface TimelineItem {
  /** Shown as written ("07:42", "In 5 min", "Yesterday"). */
  time: string;
  title: string;
  detail?: string | null;
  /** Colours the time (`list`) or the marker (`feed`). Default `neutral`. */
  tone?: TimelineTone;
  /** The marker icon in the `feed` variant (default: a dot). Not shown in `list`. */
  icon?: IconName | string;
}

export interface TimelineOptions {
  items: TimelineItem[];
  variant?: TimelineVariant;
  /** Accessible name of the list ("Departures", "Recent activity"). */
  label?: string;
  /** Makes every row a button; called with the row's index. */
  onSelect?: (index: number) => void;
}

export interface TimelineHandle {
  el: HTMLOListElement;
  setItems(items: TimelineItem[]): void;
}

export function timelineClass(variant: TimelineVariant = 'list'): string {
  return cx('mh-timeline', `mh-timeline--${variant}`);
}

/** The class of one `li`: tone modifier, and `--icon` when a `feed` marker holds an icon instead of a dot. */
export function timelineItemClass(tone: TimelineTone = 'neutral', icon = false): string {
  return cx('mh-timeline__item', tone !== 'neutral' && `mh-timeline__item--${tone}`, icon && 'mh-timeline__item--icon');
}

export function timelineRowClass(interactive = false): string {
  return cx('mh-timeline__row', interactive && 'mh-timeline__row--interactive');
}

function createTimelineItem(item: TimelineItem, index: number, variant: TimelineVariant, onSelect: ((index: number) => void) | undefined): HTMLLIElement {
  const feed = variant === 'feed';
  const icon = feed && Boolean(item.icon);
  const marker = feed ? h('span', { class: 'mh-timeline__marker', 'aria-hidden': 'true' }, item.icon ? createIcon(item.icon) : null) : null;
  const body = h(
    'span',
    { class: 'mh-timeline__body' },
    h('span', { class: 'mh-timeline__title' }, item.title),
    item.detail ? h('span', { class: 'mh-timeline__detail' }, item.detail) : null,
  );
  const time = h('span', { class: 'mh-timeline__time' }, item.time);
  const cls = timelineRowClass(Boolean(onSelect));
  const row = onSelect ? h('button', { type: 'button', class: cls }, marker, time, body) : h('div', { class: cls }, marker, time, body);
  if (onSelect) row.addEventListener('click', () => onSelect(index));
  return h('li', { class: timelineItemClass(item.tone, icon) }, row);
}

/**
 * `ol.mh-timeline`: entries in time order. `--list` puts the time in a column with tabular figures (departures,
 * reminders, events); `--feed` threads a vertical line through a `__marker` per entry (a dot, or an icon with
 * `__item--icon`) with the time as a small line above the title (activity, milestones). Each `li.__item` holds a
 * `__row` (`div`, or a `button` with `onSelect`) with `__marker` (feed), `__time` and `__body` (`__title`,
 * `__detail`). Tones: `__item--accent | --success | --warning | --danger`.
 */
export function createTimeline(options: TimelineOptions): TimelineHandle {
  const variant = options.variant ?? 'list';
  const el = h('ol', { class: timelineClass(variant), 'aria-label': options.label });
  const setItems = (items: TimelineItem[]): void => el.replaceChildren(...items.map((item, i) => createTimelineItem(item, i, variant, options.onSelect)));
  setItems(options.items);
  return { el, setItems };
}
