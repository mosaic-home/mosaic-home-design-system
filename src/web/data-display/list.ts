import { mdiChevronRight } from '@mdi/js';
import { append, cx, h, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface ListItemOptions {
  title: string;
  subtitle?: string;
  /** A leading icon in a soft square. */
  icon?: IconName | string;
  /** A leading element instead of the icon (an avatar). */
  leading?: HTMLElement;
  /** Trailing content: a value ("On", "21°") or an element (a badge, a switch on a non-pressable row). */
  trailing?: Child;
  /** Shows a chevron: the row opens something. */
  chevron?: boolean;
  /** Makes the row a button. Don't combine with an interactive `trailing` control. */
  onClick?: (event: MouseEvent) => void;
  /** Makes the row a link. */
  href?: string;
  disabled?: boolean;
  /** Marks the current row (`aria-current`). */
  current?: boolean;
  tone?: 'default' | 'danger';
}

export interface ListOptions {
  items: ListItemOptions[];
  /** Rules between rows (default true). */
  dividers?: boolean;
  /** Rows in a rounded surface, settings style. */
  inset?: boolean;
  /** Accessible name of the list. */
  label?: string;
}

export interface ListHandle {
  el: HTMLUListElement;
  setItems(items: ListItemOptions[]): void;
}

export function listClass(dividers = true, inset = false): string {
  return cx('mh-list', dividers && 'mh-list--dividers', inset && 'mh-list--inset');
}

export function listRowClass(interactive = false, tone: ListItemOptions['tone'] = 'default'): string {
  return cx('mh-list-row', interactive && 'mh-list-row--interactive', tone === 'danger' && 'mh-list-row--danger');
}

/** One `li.mh-list__item` holding a `.mh-list-row` (a `div`, or a `button` / `a` when pressable). */
export function createListItem(item: ListItemOptions): HTMLLIElement {
  const leading = item.leading
    ? h('span', { class: 'mh-list-row__leading' }, item.leading)
    : item.icon
      ? h('span', { class: 'mh-list-row__leading mh-list-row__icon' }, createIcon(item.icon))
      : null;
  const text = h(
    'span',
    { class: 'mh-list-row__text' },
    h('span', { class: 'mh-list-row__title' }, item.title),
    item.subtitle ? h('span', { class: 'mh-list-row__subtitle' }, item.subtitle) : null,
  );
  const trailing = item.trailing !== undefined && item.trailing !== null && item.trailing !== false ? h('span', { class: 'mh-list-row__trailing' }) : null;
  if (trailing) append(trailing, item.trailing);
  const chevron = item.chevron ? h('span', { class: 'mh-list-row__chevron' }, createIcon(mdiChevronRight)) : null;
  const cls = listRowClass(Boolean(item.onClick || item.href), item.tone);
  const current = item.current ? 'true' : null;
  let row: HTMLElement;
  if (item.href) row = h('a', { class: cls, href: item.href, 'aria-current': current, 'aria-disabled': item.disabled ? 'true' : null }, leading, text, trailing, chevron);
  else if (item.onClick) row = h('button', { type: 'button', class: cls, disabled: item.disabled, 'aria-current': current }, leading, text, trailing, chevron);
  else row = h('div', { class: cls, 'aria-current': current, 'aria-disabled': item.disabled ? 'true' : null }, leading, text, trailing, chevron);
  if (item.onClick) row.addEventListener('click', item.onClick);
  return h('li', { class: 'mh-list__item' }, row);
}

/** `ul.mh-list`: rows with a leading icon or avatar, title, subtitle and trailing slot. `--dividers`, `--inset`. */
export function createList(options: ListOptions): ListHandle {
  const el = h('ul', { class: listClass(options.dividers, options.inset), 'aria-label': options.label });
  const setItems = (items: ListItemOptions[]): void => el.replaceChildren(...items.map(createListItem));
  setItems(options.items);
  return { el, setItems };
}

export interface ListSectionOptions {
  title?: string;
  /** Small print under the rows. */
  footnote?: string;
  /** The list (or any content) of the section. */
  content: HTMLElement;
}

/** `section.mh-list-section`: a titled settings group (`__title`, `__footnote`) around an inset list. */
export function createListSection(options: ListSectionOptions): { el: HTMLElement } {
  const el = h(
    'section',
    { class: 'mh-list-section' },
    options.title ? h('h3', { class: 'mh-list-section__title' }, options.title) : null,
    options.content,
    options.footnote ? h('p', { class: 'mh-list-section__footnote' }, options.footnote) : null,
  );
  return { el };
}
