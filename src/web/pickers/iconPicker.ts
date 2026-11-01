import { mdiClose } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { ICONS } from '../icon-set.ts';
import { createIcon } from '../icons.ts';
import { createSearchField, type SearchFieldHandle } from '../text-inputs/searchField.ts';

export interface IconPickerItem {
  /** The value reported when picked, e.g. `lightbulb`. */
  name: string;
  /** SVG path data (24×24); default the built-in icon of that name. */
  path?: string;
  /** Spoken and shown on hover (default the name in words: `arrow-left` → "Arrow left"). */
  label?: string;
  /** Extra words the search matches. */
  keywords?: readonly string[];
}

export interface IconPickerOptions {
  /** The icons to offer: built-in names or items with their own paths. Default: every built-in icon. */
  icons?: readonly (string | IconPickerItem)[];
  value?: string | null;
  /** Shows a search box (default: when there are more than twelve icons). */
  search?: boolean;
  /** Adds a "No icon" choice first. */
  allowNone?: boolean;
  /** Accessible name of the list (default "Icon"). */
  label?: string;
  disabled?: boolean;
  onChange?: (name: string | null) => void;
}

export interface IconPickerHandle {
  el: HTMLDivElement;
  listbox: HTMLDivElement;
  search: SearchFieldHandle | null;
  getValue(): string | null;
  setValue(name: string | null): void;
  /** Filters the grid as the search box does. */
  filter(query: string): void;
  setDisabled(disabled: boolean): void;
}

/** "arrow-left" → "Arrow left". */
export function iconLabel(name: string): string {
  const words = name.replace(/[-_.:]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The built-in icon set as picker items. */
export function builtInIcons(): IconPickerItem[] {
  return Object.entries(ICONS).map(([name, path]) => ({ name, path, label: iconLabel(name) }));
}

const resolve = (item: string | IconPickerItem): Required<Omit<IconPickerItem, 'keywords'>> & { keywords: readonly string[] } => {
  const it = typeof item === 'string' ? { name: item } : item;
  return { name: it.name, path: it.path ?? (ICONS as Record<string, string>)[it.name] ?? '', label: it.label ?? iconLabel(it.name), keywords: it.keywords ?? [] };
};

/** Whether an item matches a search query (every word, in the name, label or keywords). */
export function iconMatches(item: IconPickerItem, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const hay = [item.name, item.label ?? iconLabel(item.name), ...(item.keywords ?? [])].join(' ').toLowerCase();
  return words.every((w) => hay.includes(w));
}

const NONE = '';

/**
 * `.mh-icon-picker`: an optional search box over a grid of icons (`role="listbox"`, each `.mh-icon-picker__option`
 * a `role="option"` with `aria-selected`). Arrow keys move in two dimensions, Home and End to the ends, typing in the
 * search filters, Enter or Space picks. Defaults to the built-in icon set; pass `icons` for your own.
 */
export function createIconPicker(options: IconPickerOptions = {}): IconPickerHandle {
  const items = (options.icons ?? builtInIcons()).map(resolve);
  let value: string | null = options.value ?? null;
  let disabled = false;
  const label = options.label ?? 'Icon';
  const showSearch = options.search ?? items.length > 12;

  const listbox = h('div', { class: 'mh-icon-picker__grid', role: 'listbox', 'aria-label': label, id: uid('mh-icon-picker') });
  const empty = h('p', { class: 'mh-icon-picker__empty', hidden: true }, 'No icons match.');
  const status = h('p', { class: 'mh-visually-hidden', 'aria-live': 'polite' });
  const search = showSearch ? createSearchField({ label: `Search ${label.toLowerCase()}s`, placeholder: 'Search icons', size: 'small', onInput: (q) => filter(q) }) : null;
  search?.input.setAttribute('aria-controls', listbox.id);
  const el = h('div', { class: 'mh-icon-picker', role: 'group', 'aria-label': label }, search?.el ?? null, listbox, empty, status);

  const options_ = [
    ...(options.allowNone ? [{ name: NONE, path: '', label: 'No icon', keywords: ['none', 'empty'] as readonly string[] }] : []),
    ...items,
  ].map((it) => {
    const opt = h(
      'div',
      { class: cx('mh-icon-picker__option', it.name === NONE && 'mh-icon-picker__option--none'), role: 'option', id: uid('mh-icon-option'), tabindex: -1, 'aria-selected': 'false', title: it.label, 'data-name': it.name },
      it.name === NONE ? createIcon(mdiClose) : createIcon(it.path),
      h('span', { class: 'mh-visually-hidden' }, it.label),
    );
    return { item: it, el: opt };
  });
  listbox.append(...options_.map((o) => o.el));

  const visible = (): HTMLElement[] => options_.filter((o) => !o.el.hidden).map((o) => o.el);
  let active: HTMLElement | null = null;
  const setActive = (opt: HTMLElement | null, focus: boolean): void => {
    active = opt;
    for (const o of options_) o.el.tabIndex = !disabled && o.el === opt ? 0 : -1;
    if (opt && focus) {
      opt.focus({ preventScroll: true });
      opt.scrollIntoView?.({ block: 'nearest' });
    }
  };
  const selectedEl = (): HTMLElement | undefined => options_.find((o) => (o.item.name === NONE ? value === null : o.item.name === value))?.el;

  const sync = (): void => {
    const sel = selectedEl();
    for (const o of options_) {
      const on = o.el === sel;
      o.el.setAttribute('aria-selected', String(on));
      o.el.classList.toggle('is-selected', on);
    }
    const list = visible();
    if (!active || active.hidden) setActive((sel && !sel.hidden ? sel : list[0]) ?? null, false);
    else setActive(active, false);
  };

  function filter(query: string): void {
    let n = 0;
    for (const o of options_) {
      const match = iconMatches(o.item, query);
      o.el.hidden = !match;
      if (match) n += 1;
    }
    empty.hidden = n > 0;
    status.textContent = query.trim() ? (n === 1 ? '1 icon' : `${n} icons`) : '';
    active = null;
    sync();
  }

  const pick = (opt: HTMLElement): void => {
    if (disabled) return;
    const name = opt.dataset.name ?? NONE;
    const next = name === NONE ? null : name;
    setActive(opt, true);
    if (next === value) return;
    value = next;
    sync();
    options.onChange?.(next);
  };

  /** Options per row, from the laid-out positions (one row when there's no layout, e.g. in tests). */
  const columns = (list: HTMLElement[]): number => {
    if (list.length < 2) return 1;
    const top = list[0]!.offsetTop;
    const i = list.findIndex((o) => o.offsetTop !== top);
    return i === -1 ? list.length : i;
  };

  listbox.addEventListener('click', (e) => {
    const opt = (e.target as Element).closest<HTMLElement>('.mh-icon-picker__option');
    if (opt) pick(opt);
  });
  listbox.addEventListener('keydown', (e) => {
    if (disabled) return;
    const list = visible();
    const i = active ? list.indexOf(active) : -1;
    const cols = columns(list);
    const rtl = getComputedStyle(el).direction === 'rtl';
    let to: number;
    switch (e.key) {
      case 'ArrowRight':
        to = i + (rtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        to = i + (rtl ? 1 : -1);
        break;
      case 'ArrowDown':
        to = i + cols;
        break;
      case 'ArrowUp':
        to = i - cols;
        break;
      case 'Home':
        to = e.ctrlKey ? 0 : i - (i % cols);
        break;
      case 'End':
        to = e.ctrlKey ? list.length - 1 : Math.min(list.length - 1, i - (i % cols) + cols - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (active) pick(active);
        return;
      default:
        return;
    }
    e.preventDefault();
    const next = list[Math.max(0, Math.min(list.length - 1, to))];
    if (next) setActive(next, true);
  });
  // Arrow Down from the search box goes into the grid.
  search?.input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && active) {
      e.preventDefault();
      setActive(active, true);
    }
  });

  sync();
  const handle: IconPickerHandle = {
    el,
    listbox,
    search,
    getValue: () => value,
    setValue(name) {
      value = name;
      active = null;
      sync();
    },
    filter(query) {
      search?.setValue(query);
      filter(query);
    },
    setDisabled(value_) {
      disabled = value_;
      el.classList.toggle('is-disabled', value_);
      if (value_) listbox.setAttribute('aria-disabled', 'true');
      else listbox.removeAttribute('aria-disabled');
      search?.setDisabled(value_);
      sync();
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
