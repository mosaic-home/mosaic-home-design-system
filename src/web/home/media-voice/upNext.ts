import { mdiClose, mdiMusic, mdiPlay } from '@mdi/js';
import { iconButtonClass } from '../../actions/iconButton.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { formatMediaTime } from '../mediaPlayer.ts';
import { syncChildren } from '../children.ts';

/** One thing in the queue: a track, an episode. */
export interface UpNextItem {
  id: string;
  title: string;
  /** Artist, show, album. */
  subtitle?: string | null;
  /** Artwork URL; a themed placeholder when missing or failing. */
  art?: string | null;
  /** Placeholder icon (default a music note; `film` suits episodes). */
  icon?: IconName | string;
  /** Seconds. */
  duration?: number | null;
}

/** Every word the queue shows or speaks. `{title}` is the item's title, `{count}` a number. */
export interface UpNextLabels {
  group: string;
  empty: string;
  play: string;
  remove: string;
  more: string;
}

export const UP_NEXT_LABELS: UpNextLabels = {
  group: 'Up next',
  empty: 'Nothing up next',
  play: 'Play {title} now',
  remove: 'Remove {title}',
  more: '{count} more',
};

export interface UpNextData {
  items: readonly UpNextItem[];
  /** Show at most this many, with "N more" after them. */
  max?: number;
  /** Accessible name (default "Up next"). */
  label?: string;
  labels?: Partial<UpNextLabels>;
}

export interface UpNextEvents {
  onPlay?: (id: string) => void;
  /** Without it there is no remove button. */
  onRemove?: (id: string) => void;
}

export interface UpNextOptions extends UpNextData, UpNextEvents {}

export interface UpNextHandle {
  el: HTMLDivElement;
  update(options: UpNextOptions): void;
}

const fill = (template: string, values: Record<string, string>): string => template.replace(/\{(\w+)\}/g, (all, key: string) => values[key] ?? all);

export interface UpNextItemView {
  id: string;
  title: string;
  subtitle: string;
  art: string | null;
  icon: string;
  duration: string;
  playLabel: string;
  removeLabel: string;
}

export interface UpNextView {
  labels: UpNextLabels;
  label: string;
  items: UpNextItemView[];
  /** "3 more", or empty. */
  more: string;
}

/** Everything the queue draws: the same for the web renderer and React. */
export function upNextView(data: UpNextData): UpNextView {
  const labels = { ...UP_NEXT_LABELS, ...data.labels };
  const max = data.max !== undefined && data.max >= 0 ? Math.floor(data.max) : Infinity;
  const shown = data.items.slice(0, max);
  const hidden = data.items.length - shown.length;
  return {
    labels,
    label: data.label ?? labels.group,
    items: shown.map((item) => {
      const title = item.title.trim();
      const d = item.duration;
      return {
        id: item.id,
        title,
        subtitle: item.subtitle?.trim() || '',
        art: item.art || null,
        icon: item.icon ?? mdiMusic,
        duration: d !== null && d !== undefined && Number.isFinite(d) && d > 0 ? formatMediaTime(d) : '',
        playLabel: fill(labels.play, { title }),
        removeLabel: fill(labels.remove, { title }),
      };
    }),
    more: hidden > 0 ? fill(labels.more, { count: String(hidden) }) : '',
  };
}

export function upNextArtClass(hasArt: boolean): string {
  return cx('mh-up-next__art', !hasArt && 'is-empty');
}

export function upNextButtonClass(part: 'play' | 'remove'): string {
  return cx(iconButtonClass('default', 'small'), `mh-up-next__${part}`);
}

/** After an item is removed, which index takes the focus: the one now in its place, else the one before; -1 for none. */
export function upNextFocusAfterRemove(index: number, length: number): number {
  return length === 0 ? -1 : Math.min(index, length - 1);
}

interface UpNextRow {
  el: HTMLLIElement;
  art: HTMLDivElement;
  image: HTMLImageElement;
  placeholder: HTMLSpanElement;
  icon: string | null;
  failed: string | null;
  text: HTMLDivElement;
  title: HTMLDivElement;
  subtitle: HTMLDivElement;
  duration: HTMLSpanElement;
  play: HTMLButtonElement;
  remove: HTMLButtonElement;
}

/**
 * `.mh-up-next`: the queue after what is playing, as a labelled group with an ordered `__list` of `__item`s: the
 * 1:1 `__art` (lazy `__image` or `__placeholder` icon; `.is-empty`), `__text` (`__title`, `__subtitle`), the
 * `__duration`, and `__play` / `__remove` buttons named after the item. A `__more` line counts what `max` leaves
 * out. When an item goes away while focus is in it, the focus moves to the same button of the item now in its
 * place (or the one before), so a keyboard user can remove several in a row.
 */
export function createUpNext(options: UpNextOptions): UpNextHandle {
  let current = options;
  let view = upNextView(options);
  const rows = new Map<string, UpNextRow>();
  const list = h('ol', { class: 'mh-up-next__list' });
  const empty = h('p', { class: 'mh-up-next__empty' });
  const more = h('p', { class: 'mh-up-next__more' });
  const el = h('div', { class: 'mh-up-next', role: 'group' });

  const showArt = (r: UpNextRow, item: UpNextItemView): void => {
    const has = !!item.art && r.failed !== item.art;
    r.art.className = upNextArtClass(has);
    if (has && r.image.getAttribute('src') !== item.art) r.image.src = item.art!;
    syncChildren(r.art, has ? [r.placeholder, r.image] : [r.placeholder]);
  };

  const row = (id: string): UpNextRow => {
    const existing = rows.get(id);
    if (existing) return existing;
    const image = h('img', { class: 'mh-up-next__image', alt: '', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
    const title = h('div', { class: 'mh-up-next__title' });
    const r: UpNextRow = {
      el: h('li', { class: 'mh-up-next__item' }),
      art: h('div', { 'aria-hidden': 'true' }),
      image,
      placeholder: h('span', { class: 'mh-up-next__placeholder' }),
      icon: null,
      failed: null,
      text: h('div', { class: 'mh-up-next__text' }, title),
      title,
      subtitle: h('div', { class: 'mh-up-next__subtitle' }),
      duration: h('span', { class: 'mh-up-next__duration' }),
      play: h('button', { type: 'button', class: upNextButtonClass('play') }, createIcon(mdiPlay)),
      remove: h('button', { type: 'button', class: upNextButtonClass('remove') }, createIcon(mdiClose)),
    };
    image.addEventListener('error', () => {
      const item = view.items.find((i) => i.id === id);
      r.failed = item?.art ?? null;
      if (item) showArt(r, item);
    });
    r.play.addEventListener('click', () => current.onPlay?.(id));
    r.remove.addEventListener('click', () => current.onRemove?.(id));
    rows.set(id, r);
    return r;
  };

  const name = (b: HTMLButtonElement, label: string): void => {
    b.setAttribute('aria-label', label);
    b.title = label;
  };

  const render = (): void => {
    const v = view;
    el.setAttribute('aria-label', v.label);
    // Where the focus was, in case its item goes away.
    const active = document.activeElement;
    const order = [...rows.entries()].filter(([, r]) => r.el.parentNode === list).map(([id]) => id);
    const lost = order.findIndex((id) => rows.get(id)!.el.contains(active));
    const lostPart = lost >= 0 && rows.get(order[lost]!)!.remove === active ? 'remove' : 'play';

    const seen = new Set<string>();
    const items = v.items.map((item) => {
      seen.add(item.id);
      const r = row(item.id);
      if (r.icon !== item.icon) {
        r.icon = item.icon;
        r.placeholder.replaceChildren(createIcon(item.icon));
      }
      showArt(r, item);
      r.title.textContent = item.title;
      r.subtitle.textContent = item.subtitle;
      syncChildren(r.text, item.subtitle ? [r.title, r.subtitle] : [r.title]);
      r.duration.textContent = item.duration;
      name(r.play, item.playLabel);
      name(r.remove, item.removeLabel);
      syncChildren(r.el, [r.art, r.text, ...(item.duration ? [r.duration] : []), r.play, ...(current.onRemove ? [r.remove] : [])]);
      return r.el;
    });
    for (const id of [...rows.keys()]) if (!seen.has(id)) rows.delete(id);
    syncChildren(list, items);
    empty.textContent = v.labels.empty;
    more.textContent = v.more;
    syncChildren(el, [v.items.length ? list : empty, ...(v.more ? [more] : [])]);

    if (lost >= 0 && !seen.has(order[lost]!)) {
      // Count the survivors before the lost item to find the one now in its place.
      const before = order.slice(0, lost).filter((id) => seen.has(id)).length;
      const to = upNextFocusAfterRemove(before, v.items.length);
      const target = to < 0 ? null : rows.get(v.items[to]!.id)!;
      (target ? (lostPart === 'remove' && current.onRemove ? target.remove : target.play) : el).focus();
    }
  };
  el.tabIndex = -1;
  render();

  return {
    el,
    update(next) {
      current = next;
      view = upNextView(next);
      render();
    },
  };
}
