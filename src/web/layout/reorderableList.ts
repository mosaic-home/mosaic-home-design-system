import { mdiDragVertical } from '@mdi/js';
import { h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface ReorderableItem {
  id: string;
  label: string;
  description?: string;
  icon?: IconName | string;
  /** An element at the end of the row (a switch, a count). */
  trailing?: HTMLElement;
}

/** Everything the list says, for other languages. Positions count from 1. */
export interface ReorderMessages {
  /** How to reorder from the keyboard; read with every handle. */
  instructions: string;
  /** The handle's accessible name. */
  handle(label: string): string;
  grabbed(label: string, position: number, count: number): string;
  moved(label: string, position: number, count: number): string;
  dropped(label: string, position: number, count: number): string;
  cancelled(label: string, position: number, count: number): string;
}

export const defaultReorderMessages: ReorderMessages = {
  instructions: 'Press Space to pick up. Use the up and down arrows to move, Space to drop, Escape to cancel.',
  handle: (label) => `Reorder ${label}`,
  grabbed: (label, position, count) => `${label} picked up, position ${position} of ${count}.`,
  moved: (label, position, count) => `${label} moved to position ${position} of ${count}.`,
  dropped: (label, position, count) => `${label} dropped at position ${position} of ${count}.`,
  cancelled: (label, position, count) => `Reorder cancelled. ${label} is back at position ${position} of ${count}.`,
};

export interface ReorderBehaviour {
  /** Moves the item at `from` to `to` (indexes in the current order). The web renderer moves the row; React updates its items. */
  onMove: (from: number, to: number) => void;
  messages?: Partial<ReorderMessages>;
}

export interface ReorderableListOptions {
  items: readonly ReorderableItem[];
  /** Accessible name of the list. */
  label: string;
  messages?: Partial<ReorderMessages>;
  /** The new order of ids, after every drop or keyboard move. */
  onChange?: (ids: string[]) => void;
}

export interface ReorderController {
  destroy(): void;
}

export interface ReorderableListHandle extends ReorderController {
  el: HTMLDivElement;
  order(): string[];
  setItems(items: readonly ReorderableItem[]): void;
}

/** Moves one entry of an array; returns a new array. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}

/**
 * Where a dragged row lands: the index whose slot its centre has crossed. `mids` are the resting centres of every
 * row, `from` the dragged row's index and `center` its current centre.
 */
export function reorderTarget(mids: readonly number[], from: number, center: number): number {
  let to = from;
  for (let i = from + 1; i < mids.length && center > mids[i]!; i++) to = i;
  for (let i = from - 1; i >= 0 && center < mids[i]!; i--) to = i;
  return to;
}

/**
 * Reordering on existing markup (`.mh-reorder` with `__list` rows of `__item[data-id]`, each with a `__handle`
 * button, and a `__live` region). Pointer: drag a handle; the other rows make room. Keyboard: Space or Enter
 * picks a row up, the arrows (Home, End) move it, Space or Enter drops it, Escape puts it back; every step is
 * announced. Shared with the React binding.
 */
export function bindReorderableList(root: HTMLElement, behaviour: ReorderBehaviour): ReorderController {
  const msg = (): ReorderMessages => ({ ...defaultReorderMessages, ...behaviour.messages });
  const list = root.querySelector<HTMLElement>(':scope > .mh-reorder__list')!;
  const live = root.querySelector<HTMLElement>(':scope > .mh-reorder__live')!;
  const rows = (): HTMLElement[] => Array.from(list.children).filter((c): c is HTMLElement => c.classList.contains('mh-reorder__item'));
  const labelOf = (row: HTMLElement): string => row.querySelector('.mh-reorder__label')?.textContent ?? '';
  const rowById = (id: string): HTMLElement | undefined => rows().find((r) => r.dataset.id === id);
  const announce = (text: string): void => {
    live.textContent = text;
  };

  // Keyboard ------------------------------------------------------------------------------------------------
  let grabbed: { id: string; origin: number } | null = null;

  const setGrabbed = (row: HTMLElement | undefined, on: boolean): void => {
    if (!row) return;
    row.classList.toggle('is-grabbed', on);
    row.querySelector('.mh-reorder__handle')?.setAttribute('aria-pressed', String(on));
  };
  const refocus = (): void => {
    if (!grabbed) return;
    const handle = rowById(grabbed.id)?.querySelector<HTMLElement>('.mh-reorder__handle');
    if (handle && document.activeElement !== handle) handle.focus({ preventScroll: false });
    if (handle) setGrabbed(rowById(grabbed.id), true);
  };
  const moveTo = (from: number, to: number): void => {
    behaviour.onMove(from, to);
    refocus();
    // React reorders its rows after the handler returns.
    queueMicrotask(refocus);
  };
  const drop = (cancel: boolean): void => {
    if (!grabbed) return;
    const state = grabbed;
    const all = rows();
    const at = all.findIndex((r) => r.dataset.id === state.id);
    const row = all[at];
    if (cancel && at !== state.origin && at >= 0) moveTo(at, state.origin);
    grabbed = null;
    setGrabbed(rowById(state.id), false);
    if (row) announce((cancel ? msg().cancelled : msg().dropped)(labelOf(row), (cancel ? state.origin : at) + 1, all.length));
  };

  const onKey = (e: KeyboardEvent): void => {
    const handle = (e.target as HTMLElement).closest?.('.mh-reorder__handle');
    if (!handle || !list.contains(handle)) return;
    const row = handle.closest<HTMLElement>('.mh-reorder__item')!;
    const all = rows();
    const at = all.indexOf(row);
    const pick = e.key === ' ' || e.key === 'Enter';
    if (!grabbed || grabbed.id !== row.dataset.id) {
      if (!pick) return;
      e.preventDefault();
      if (grabbed) drop(false);
      grabbed = { id: row.dataset.id ?? '', origin: at };
      setGrabbed(row, true);
      announce(msg().grabbed(labelOf(row), at + 1, all.length));
      return;
    }
    let to: number | null = null;
    if (e.key === 'ArrowUp') to = Math.max(0, at - 1);
    else if (e.key === 'ArrowDown') to = Math.min(all.length - 1, at + 1);
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = all.length - 1;
    else if (pick || e.key === 'Escape') {
      e.preventDefault();
      drop(e.key === 'Escape');
      return;
    }
    if (to === null) return;
    e.preventDefault();
    if (to !== at) moveTo(at, to);
    announce(msg().moved(labelOf(row), to + 1, all.length));
  };
  // Space activates a button on key up; the list has handled it on key down.
  const onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === ' ' && (e.target as HTMLElement).closest?.('.mh-reorder__handle')) e.preventDefault();
  };
  const onFocusOut = (): void => {
    if (!grabbed) return;
    requestAnimationFrame(() => {
      if (!grabbed) return;
      const handle = rowById(grabbed.id)?.querySelector('.mh-reorder__handle');
      if (document.activeElement !== handle) drop(false);
    });
  };

  // Pointer -------------------------------------------------------------------------------------------------
  let drag: { pointer: number; row: HTMLElement; from: number; to: number; startY: number; mids: number[]; others: HTMLElement[]; step: number } | null = null;

  const onDown = (e: PointerEvent): void => {
    const handle = (e.target as HTMLElement).closest?.<HTMLElement>('.mh-reorder__handle');
    if (!handle || !list.contains(handle) || e.button !== 0 || drag) return;
    if (grabbed) drop(false);
    const all = rows();
    const row = handle.closest<HTMLElement>('.mh-reorder__item')!;
    const from = all.indexOf(row);
    const rects = all.map((r) => r.getBoundingClientRect());
    const own = rects[from]!;
    const next = rects[from + 1] ?? rects[from - 1];
    const gap = next ? Math.max(0, next.top > own.top ? next.top - own.bottom : own.top - next.bottom) : 0;
    e.preventDefault();
    handle.setPointerCapture?.(e.pointerId);
    drag = { pointer: e.pointerId, row, from, to: from, startY: e.clientY, mids: rects.map((r) => r.top + r.height / 2), others: all, step: own.height + gap };
    root.classList.add('is-sorting');
    row.classList.add('is-dragging');
  };
  const onMove = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const dy = e.clientY - drag.startY;
    drag.row.style.transform = `translateY(${dy}px)`;
    drag.to = reorderTarget(drag.mids, drag.from, drag.mids[drag.from]! + dy);
    drag.others.forEach((r, i) => {
      if (r === drag!.row) return;
      const shift = drag!.from < i && i <= drag!.to ? -drag!.step : drag!.to <= i && i < drag!.from ? drag!.step : 0;
      r.style.transform = shift ? `translateY(${shift}px)` : '';
    });
  };
  const end = (e: PointerEvent, commit: boolean): void => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const { row, from, to, others } = drag;
    drag = null;
    root.classList.remove('is-sorting');
    row.classList.remove('is-dragging');
    for (const r of others) r.style.transform = '';
    if (commit && to !== from) {
      behaviour.onMove(from, to);
      announce(msg().dropped(labelOf(row), to + 1, others.length));
    }
  };
  const onUp = (e: PointerEvent): void => end(e, true);
  const onCancel = (e: PointerEvent): void => end(e, false);

  root.addEventListener('keydown', onKey);
  root.addEventListener('keyup', onKeyUp);
  root.addEventListener('focusout', onFocusOut);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);
  return {
    destroy: () => {
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('keyup', onKeyUp);
      root.removeEventListener('focusout', onFocusOut);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onCancel);
    },
  };
}

/** One row's markup. */
export function reorderRow(item: ReorderableItem, instructionsId: string, messages: Partial<ReorderMessages> = {}): HTMLLIElement {
  const m = { ...defaultReorderMessages, ...messages };
  return h(
    'li',
    { class: 'mh-reorder__item', 'data-id': item.id },
    h('button', { type: 'button', class: 'mh-reorder__handle', 'aria-label': m.handle(item.label), 'aria-describedby': instructionsId, 'aria-pressed': 'false' }, createIcon(mdiDragVertical)),
    item.icon ? createIcon(item.icon, { class: 'mh-reorder__icon' }) : null,
    h(
      'div',
      { class: 'mh-reorder__text' },
      h('span', { class: 'mh-reorder__label' }, item.label),
      item.description ? h('span', { class: 'mh-reorder__description' }, item.description) : null,
    ),
    item.trailing ? h('div', { class: 'mh-reorder__trailing' }, item.trailing) : null,
  );
}

/**
 * `.mh-reorder` (`.is-sorting` while dragging): a list (`__list`) of rows (`__item`, `.is-dragging`,
 * `.is-grabbed`) with a drag `__handle` (`aria-pressed` while picked up from the keyboard), an `__icon`, the
 * `__text` (`__label`, `__description`) and a `__trailing` slot; SR-only instructions and a `__live` region.
 */
export function createReorderableList(options: ReorderableListOptions): ReorderableListHandle {
  const instructionsId = uid('mh-reorder');
  const m = { ...defaultReorderMessages, ...options.messages };
  const list = h('ul', { class: 'mh-reorder__list', 'aria-label': options.label });
  const el = h(
    'div',
    { class: 'mh-reorder' },
    h('p', { class: 'mh-visually-hidden', id: instructionsId }, m.instructions),
    list,
    h('div', { class: 'mh-reorder__live mh-visually-hidden', 'aria-live': 'assertive', 'aria-atomic': 'true' }),
  );
  const order = (): string[] => Array.from(list.children).map((r) => (r as HTMLElement).dataset.id ?? '');
  const setItems = (items: readonly ReorderableItem[]): void => {
    list.replaceChildren(...items.map((item) => reorderRow(item, instructionsId, options.messages)));
  };
  setItems(options.items);
  const controller = bindReorderableList(el, {
    messages: options.messages,
    onMove: (from, to) => {
      const rows = Array.from(list.children);
      const row = rows[from];
      if (!row || from === to) return;
      rows.splice(from, 1);
      list.insertBefore(row, rows[to] ?? null);
      options.onChange?.(order());
    },
  });
  return { el, order, setItems, ...controller };
}
