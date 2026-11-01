import { mdiMusic } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface MediaListItem {
  title: string;
  /** Artist, show, album or source. */
  subtitle?: string | null;
  /** Duration, year, episode ("3:42", "S2 E4"). Shown after the subtitle as "subtitle · meta". */
  meta?: string | null;
  /** Thumbnail URL; `null`, missing or failing to load shows the placeholder. */
  image?: string | null;
  /** Placeholder icon for this row (default: the list's `placeholder`). */
  placeholder?: IconName | string;
}

export interface MediaListOptions {
  items: MediaListItem[];
  /** Accessible name of the list ("Search results", "Up next"). */
  label?: string;
  /** Placeholder icon when a row has no image (default `music`; `film` for video). */
  placeholder?: IconName | string;
  /** A trailing icon on every row (`play`), showing what selecting the row does. */
  action?: IconName | string;
  /** What the action does, the start of each row's accessible name ("Play"). */
  actionLabel?: string;
  /** Makes every row a button; called with the row's index. */
  onSelect?: (index: number) => void;
}

export interface MediaListHandle {
  el: HTMLUListElement;
  setItems(items: MediaListItem[]): void;
}

export function mediaListRowClass(interactive = false): string {
  return cx('mh-media-list__row', interactive && 'mh-media-list__row--interactive');
}

/** The muted second line: "subtitle · meta", either alone, or '' when there is neither. */
export function mediaListSecondary(item: Pick<MediaListItem, 'subtitle' | 'meta'>): string {
  return [item.subtitle, item.meta].filter((s): s is string => Boolean(s)).join(' · ');
}

/** The accessible name of a pressable row: "Play: Title, Subtitle, 3:42". */
export function mediaListItemLabel(item: MediaListItem, actionLabel?: string): string {
  const title = actionLabel ? `${actionLabel}: ${item.title}` : item.title;
  return [title, item.subtitle, item.meta].filter((s): s is string => Boolean(s)).join(', ');
}

/** Attributes of the thumbnail image: lazy, and no referrer sent to the image host. */
export const MEDIA_LIST_IMAGE_ATTRS = { loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer', alt: '' } as const;

function createMediaListItem(item: MediaListItem, index: number, options: MediaListOptions): HTMLLIElement {
  const thumb = h('span', { class: 'mh-media-list__thumb', 'aria-hidden': 'true' }, createIcon(item.placeholder ?? options.placeholder ?? mdiMusic, { class: 'mh-media-list__placeholder' }));
  if (item.image) {
    const img = h('img', { class: 'mh-media-list__image', src: item.image, ...MEDIA_LIST_IMAGE_ATTRS });
    img.addEventListener('error', () => (img.hidden = true));
    thumb.append(img);
  }
  const secondary = mediaListSecondary(item);
  const text = h(
    'span',
    { class: 'mh-media-list__text' },
    h('span', { class: 'mh-media-list__title' }, item.title),
    secondary ? h('span', { class: 'mh-media-list__subtitle' }, secondary) : null,
  );
  const action = options.action ? h('span', { class: 'mh-media-list__action', 'aria-hidden': 'true' }, createIcon(options.action)) : null;
  const { onSelect } = options;
  const cls = mediaListRowClass(Boolean(onSelect));
  const row = onSelect
    ? h('button', { type: 'button', class: cls, 'aria-label': mediaListItemLabel(item, options.actionLabel) }, thumb, text, action)
    : h('div', { class: cls }, thumb, text, action);
  if (onSelect) row.addEventListener('click', () => onSelect(index));
  return h('li', { class: 'mh-media-list__item' }, row);
}

/**
 * `ul.mh-media-list`: songs, episodes, films. Each `li.__item` holds a `__row` (`div`, or a `button` named "Play:
 * Title, Subtitle, Meta" with `onSelect`): a square `__thumb` (themed `__placeholder` icon under a lazy
 * `__image` that hides itself on error), `__text` (`__title` on one line, `__subtitle` "subtitle · meta") and an
 * optional `__action` icon.
 */
export function createMediaList(options: MediaListOptions): MediaListHandle {
  const el = h('ul', { class: 'mh-media-list', 'aria-label': options.label });
  const setItems = (items: MediaListItem[]): void => el.replaceChildren(...items.map((item, i) => createMediaListItem(item, i, options)));
  setItems(options.items);
  return { el, setItems };
}
