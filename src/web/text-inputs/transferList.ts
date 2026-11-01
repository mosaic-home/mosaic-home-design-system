import { mdiCheck, mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';
import { matchesQuery, nextEnabled, revealOption } from './listbox.ts';
import { createSearchField } from './searchField.ts';

export interface TransferItem {
  value: string;
  label: string;
  description?: string;
  icon?: IconName | string;
  /** Can't be moved either way. */
  disabled?: boolean;
}

/** Which list: `source` (available, on the start side) or `target` (chosen, on the end side). */
export type TransferSide = 'source' | 'target';

/** The default texts of a transfer list. */
export const TRANSFER_TEXT = {
  source: 'Available',
  target: 'Selected',
  empty: 'Nothing here',
  filter: 'Filter',
  moveSelected: (to: string) => `Move selected to ${to}`,
  moveAll: (to: string) => `Move all to ${to}`,
  moved: (n: number, to: string) => `${n} moved to ${to}`,
} as const;

/** The items on one side, in the order of `items`, matching the side's filter. */
export function transferSideItems(items: readonly TransferItem[], values: readonly string[], side: TransferSide, query = ''): TransferItem[] {
  const chosen = new Set(values);
  return items.filter((i) => chosen.has(i.value) === (side === 'target') && matchesQuery(`${i.label} ${i.description ?? ''}`, query));
}

/** The new target values after moving `moving` to `to` (disabled items stay put). Keeps `items` order. */
export function transferMove(items: readonly TransferItem[], values: readonly string[], moving: readonly string[], to: TransferSide): string[] {
  const set = new Set(values);
  const movable = new Set(items.filter((i) => !i.disabled).map((i) => i.value));
  for (const v of moving) {
    if (!movable.has(v)) continue;
    if (to === 'target') set.add(v);
    else set.delete(v);
  }
  return items.filter((i) => set.has(i.value)).map((i) => i.value);
}

/** The values that are items, in the order of `items`. */
export function transferNormalize(items: readonly TransferItem[], values: readonly string[]): string[] {
  const set = new Set(values);
  return items.filter((i) => set.has(i.value)).map((i) => i.value);
}

/** The count shown in a panel's header: `n` or, with a selection, `selected/n`. */
export const transferCount = (selected: number, total: number): string => (selected > 0 ? `${selected}/${total}` : String(total));

/** What a key does on a transfer listbox. */
export type TransferKeyAction =
  | { type: 'none' }
  | { type: 'move-active'; index: number; extend: boolean }
  | { type: 'toggle' }
  | { type: 'select-all' }
  | { type: 'transfer' };

/** The keyboard model of a panel (ARIA multi-select listbox): shared by the web and React renderers. */
export function transferKey(event: { key: string; shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }, items: readonly TransferItem[], active: number): TransferKeyAction {
  const extend = !!event.shiftKey;
  switch (event.key) {
    case 'ArrowDown':
      return { type: 'move-active', index: nextEnabled(items, active, 1), extend };
    case 'ArrowUp':
      return { type: 'move-active', index: nextEnabled(items, active < 0 ? items.length : active, -1), extend };
    case 'Home':
      return { type: 'move-active', index: nextEnabled(items, -1, 1), extend: false };
    case 'End':
      return { type: 'move-active', index: nextEnabled(items, items.length, -1), extend: false };
    case ' ':
      return { type: 'toggle' };
    case 'Enter':
      return { type: 'transfer' };
    case 'a':
    case 'A':
      return event.ctrlKey || event.metaKey ? { type: 'select-all' } : { type: 'none' };
    default:
      return { type: 'none' };
  }
}

export const transferListClass = (disabled = false): string => cx('mh-transfer', disabled && 'is-disabled');

/** The move buttons' icons. */
export const TRANSFER_ICONS = { one: { target: mdiChevronRight, source: mdiChevronLeft }, all: { target: mdiChevronDoubleRight, source: mdiChevronDoubleLeft } } as const;

/** CSS classes of a move button. */
export const TRANSFER_BUTTON_CLASS = cx(iconButtonClass('default', 'medium', true), 'mh-transfer__move');

export interface TransferListOptions {
  /** Visible label of the whole control. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  items: readonly TransferItem[];
  /** Values in the target list. */
  values?: readonly string[];
  sourceLabel?: string;
  targetLabel?: string;
  /** Shown in an empty list (default "Nothing here"). */
  emptyText?: string;
  /** A filter field above each list. */
  searchable?: boolean;
  helper?: string;
  error?: string;
  disabled?: boolean;
  labelStyle?: 'label' | 'eyebrow';
  onChange?: (values: string[]) => void;
}

export interface TransferListHandle {
  el: HTMLElement;
  field: FieldHandle | null;
  /** The two listboxes. */
  lists: Record<TransferSide, HTMLDivElement>;
  getValues(): string[];
  setValues(values: readonly string[]): void;
  setItems(items: readonly TransferItem[]): void;
  setDisabled(disabled: boolean): void;
}

interface Panel {
  side: TransferSide;
  title: string;
  list: HTMLDivElement;
  count: HTMLSpanElement;
  empty: HTMLParagraphElement;
  query: string;
  selected: Set<string>;
  active: string | null;
  anchor: number;
}

/**
 * `.mh-transfer`: moves items between two lists. Each `__panel` has a header with its count, an optional filter
 * and a multi-select listbox: pressing an item toggles it, Space toggles the active one, Shift+arrows extend,
 * Ctrl/⌘+A selects all, Enter moves the selection across and a double press moves one item. The `__actions` in
 * between move the selection or everything shown. On narrow containers the panels stack and the arrows turn.
 */
export function createTransferList(options: TransferListOptions): TransferListHandle {
  const base = uid('mh-transfer');
  let items = options.items;
  let values = transferNormalize(items, options.values ?? []);
  let disabled = false;
  const status = h('span', { class: 'mh-visually-hidden', role: 'status' });

  const makePanel = (side: TransferSide): { panel: Panel; el: HTMLElement } => {
    const title = side === 'source' ? (options.sourceLabel ?? TRANSFER_TEXT.source) : (options.targetLabel ?? TRANSFER_TEXT.target);
    const titleId = `${base}-${side}-title`;
    const list = h('div', { class: 'mh-transfer__list', id: `${base}-${side}`, role: 'listbox', 'aria-multiselectable': 'true', 'aria-labelledby': titleId, tabindex: '0' });
    const count = h('span', { class: 'mh-transfer__count' });
    const empty = h('p', { class: 'mh-transfer__empty', id: `${base}-${side}-empty` }, options.emptyText ?? TRANSFER_TEXT.empty);
    const panel: Panel = { side, title, list, count, empty, query: '', selected: new Set(), active: null, anchor: -1 };
    const search = options.searchable
      ? createSearchField({
          size: 'small',
          label: `${TRANSFER_TEXT.filter} ${title}`,
          placeholder: TRANSFER_TEXT.filter,
          onInput: (q) => {
            panel.query = q;
            render();
          },
        })
      : null;
    const el = h(
      'div',
      { class: cx('mh-transfer__panel', `mh-transfer__panel--${side}`) },
      h('div', { class: 'mh-transfer__head' }, h('span', { class: 'mh-transfer__title', id: titleId }, title), count),
      search ? h('div', { class: 'mh-transfer__filter' }, search.el) : null,
      list,
      empty,
    );
    list.addEventListener('keydown', (event) => onKey(panel, event));
    list.addEventListener('focus', () => {
      const shown = sideItems(panel);
      if (panel.active === null || !shown.some((i) => i.value === panel.active)) {
        panel.active = shown[nextEnabled(shown, -1, 1)]?.value ?? null;
        render();
      }
    });
    return { panel, el };
  };

  const source = makePanel('source');
  const target = makePanel('target');
  const panels = [source.panel, target.panel];
  const other = (p: Panel): Panel => (p === source.panel ? target.panel : source.panel);
  const sideItems = (p: Panel): TransferItem[] => transferSideItems(items, values, p.side, p.query);

  const button = (label: string, icon: string, run: () => void): HTMLButtonElement => {
    const b = h('button', { type: 'button', class: TRANSFER_BUTTON_CLASS, 'aria-label': label, title: label }, createIcon(icon));
    b.addEventListener('click', run);
    return b;
  };
  const sourceTitle = source.panel.title;
  const targetTitle = target.panel.title;
  const toTargetOne = button(TRANSFER_TEXT.moveSelected(targetTitle), TRANSFER_ICONS.one.target, () => transfer(source.panel, false));
  const toTargetAll = button(TRANSFER_TEXT.moveAll(targetTitle), TRANSFER_ICONS.all.target, () => transfer(source.panel, true));
  const toSourceOne = button(TRANSFER_TEXT.moveSelected(sourceTitle), TRANSFER_ICONS.one.source, () => transfer(target.panel, false));
  const toSourceAll = button(TRANSFER_TEXT.moveAll(sourceTitle), TRANSFER_ICONS.all.source, () => transfer(target.panel, true));
  const actions = h('div', { class: 'mh-transfer__actions' }, toTargetOne, toTargetAll, toSourceOne, toSourceAll);
  const root = h('div', { class: transferListClass(), role: 'group', 'aria-label': options.label ? undefined : options.ariaLabel }, h('div', { class: 'mh-transfer__layout' }, source.el, actions, target.el), status);
  const field = options.label ? createField({ label: options.label, control: root, target: root, helper: options.helper, error: options.error, labelStyle: options.labelStyle }) : null;

  const renderPanel = (p: Panel): void => {
    const shown = sideItems(p);
    for (const v of [...p.selected]) if (!shown.some((i) => i.value === v)) p.selected.delete(v);
    if (p.active !== null && !shown.some((i) => i.value === p.active)) p.active = null;
    p.list.replaceChildren(
      ...shown.map((item, index) => {
        const row = h(
          'div',
          {
            class: cx('mh-transfer__option', item.value === p.active && 'is-active'),
            id: `${p.list.id}-${items.indexOf(item)}`,
            role: 'option',
            'aria-selected': String(p.selected.has(item.value)),
            'aria-disabled': item.disabled ? 'true' : undefined,
          },
          h('span', { class: 'mh-transfer__check' }, createIcon(mdiCheck)),
          item.icon ? createIcon(item.icon, { class: 'mh-transfer__icon' }) : null,
          h('span', { class: 'mh-transfer__text' }, h('span', { class: 'mh-transfer__label' }, item.label), item.description ? h('span', { class: 'mh-transfer__description' }, item.description) : null),
        );
        row.addEventListener('mousedown', (event) => {
          // Focus the list, not the row, so the keyboard picks up where the pointer left off.
          event.preventDefault();
          p.list.focus();
        });
        row.addEventListener('click', (event) => {
          if (disabled || item.disabled) return;
          p.active = item.value;
          if (event.shiftKey && p.anchor >= 0) selectRange(p, shown, p.anchor, index);
          else {
            toggle(p, item.value);
            p.anchor = index;
          }
          render();
        });
        row.addEventListener('dblclick', () => {
          if (disabled || item.disabled) return;
          p.selected = new Set([item.value]);
          transfer(p, false);
        });
        return row;
      }),
    );
    p.empty.hidden = shown.length > 0;
    if (shown.length === 0) p.list.setAttribute('aria-describedby', p.empty.id);
    else p.list.removeAttribute('aria-describedby');
    p.count.textContent = transferCount(p.selected.size, shown.length);
    p.list.tabIndex = disabled ? -1 : 0;
    if (disabled) p.list.setAttribute('aria-disabled', 'true');
    else p.list.removeAttribute('aria-disabled');
    if (p.active !== null) {
      const id = `${p.list.id}-${items.findIndex((i) => i.value === p.active)}`;
      p.list.setAttribute('aria-activedescendant', id);
      revealOption(p.list.querySelector(`[id="${id}"]`));
    } else p.list.removeAttribute('aria-activedescendant');
  };
  const render = (): void => {
    for (const p of panels) renderPanel(p);
    root.className = transferListClass(disabled);
    const movable = (p: Panel, onlySelected: boolean): boolean => sideItems(p).some((i) => !i.disabled && (!onlySelected || p.selected.has(i.value)));
    toTargetOne.disabled = disabled || !movable(source.panel, true);
    toTargetAll.disabled = disabled || !movable(source.panel, false);
    toSourceOne.disabled = disabled || !movable(target.panel, true);
    toSourceAll.disabled = disabled || !movable(target.panel, false);
  };
  const toggle = (p: Panel, value: string): void => {
    if (p.selected.has(value)) p.selected.delete(value);
    else p.selected.add(value);
  };
  const selectRange = (p: Panel, shown: TransferItem[], from: number, to: number): void => {
    const [a, b] = from < to ? [from, to] : [to, from];
    for (let i = a; i <= b; i++) if (!shown[i]!.disabled) p.selected.add(shown[i]!.value);
  };
  function transfer(from: Panel, all: boolean): void {
    if (disabled) return;
    const shown = sideItems(from);
    const moving = shown.filter((i) => !i.disabled && (all || from.selected.has(i.value))).map((i) => i.value);
    if (moving.length === 0) return;
    const to = other(from);
    // The active item moves to the nearest one left behind.
    const at = shown.findIndex((i) => i.value === from.active);
    values = transferMove(items, values, moving, to.side);
    from.selected.clear();
    from.anchor = -1;
    const left = sideItems(from);
    from.active = left.length ? left[Math.min(Math.max(at, 0), left.length - 1)]!.value : null;
    status.textContent = TRANSFER_TEXT.moved(moving.length, to.title);
    render();
    options.onChange?.([...values]);
  }
  function onKey(p: Panel, event: KeyboardEvent): void {
    if (disabled) return;
    const shown = sideItems(p);
    const current = shown.findIndex((i) => i.value === p.active);
    const action = transferKey(event, shown, current);
    if (action.type === 'none') return;
    event.preventDefault();
    switch (action.type) {
      case 'move-active': {
        const next = shown[action.index];
        if (!next) return;
        p.active = next.value;
        if (action.extend) {
          if (current >= 0 && !shown[current]!.disabled) p.selected.add(shown[current]!.value);
          if (!next.disabled) p.selected.add(next.value);
        }
        break;
      }
      case 'toggle':
        if (current >= 0 && !shown[current]!.disabled) {
          toggle(p, shown[current]!.value);
          p.anchor = current;
        }
        break;
      case 'select-all': {
        const movable = shown.filter((i) => !i.disabled);
        const allOn = movable.every((i) => p.selected.has(i.value));
        p.selected = allOn ? new Set() : new Set(movable.map((i) => i.value));
        break;
      }
      case 'transfer':
        if (p.selected.size === 0 && current >= 0) p.selected.add(shown[current]!.value);
        transfer(p, false);
        return;
    }
    render();
  }

  const handle: TransferListHandle = {
    el: field?.el ?? root,
    field,
    lists: { source: source.panel.list, target: target.panel.list },
    getValues: () => [...values],
    setValues(next) {
      values = transferNormalize(items, next);
      render();
    },
    setItems(next) {
      items = next;
      values = transferNormalize(items, values);
      render();
    },
    setDisabled(next) {
      disabled = next;
      field?.setDisabled(next);
      render();
    },
  };
  render();
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
