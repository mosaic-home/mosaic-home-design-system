import { mdiCheck, mdiChevronDown, mdiClose, mdiDragVertical, mdiMinus, mdiPlus } from '@mdi/js';
import { createButton } from '../../actions/button.ts';
import { iconButtonClass } from '../../actions/iconButton.ts';
import { cx, h, uid } from '../../dom.ts';
import { createIcon } from '../../icons.ts';
import { bindReorderableList, defaultReorderMessages, moveItem, type ReorderMessages } from '../../layout/reorderableList.ts';
import { inputClass } from '../../text-inputs/textField.ts';
import { syncChildren } from '../children.ts';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  /** A second line ("2 packs", "by Friday"). */
  note?: string | null;
}

export interface TodoListLabels {
  /** The add button's name. */
  add: string;
  /** The add field's name and placeholder. */
  newItem: string;
  /** The completed section's toggle. */
  completed: (count: number) => string;
  clearCompleted: string;
  remove: (text: string) => string;
  /** Shown when nothing is on the list. */
  empty: string;
  /** Shown when everything is checked off. */
  allDone: string;
  /** Announced after a change. */
  added: (text: string) => string;
  checked: (text: string) => string;
  unchecked: (text: string) => string;
}

export const TODO_LIST_LABELS: TodoListLabels = {
  add: 'Add',
  newItem: 'Add an item',
  completed: (n) => `Completed (${n})`,
  clearCompleted: 'Clear completed',
  remove: (text) => `Remove ${text}`,
  empty: 'Nothing on the list',
  allDone: 'All done',
  added: (text) => `${text} added`,
  checked: (text) => `${text} checked off`,
  unchecked: (text) => `${text} back on the list`,
};

export interface TodoListOptions {
  /** The list's name ("Shopping"), its accessible name. */
  label: string;
  items: readonly TodoItem[];
  /** Shows the add field; called with the trimmed text. */
  onAdd?: (text: string) => void;
  onToggle?: (id: string, done: boolean) => void;
  /** Shows drag handles on the open items; called with the new order of the open items' ids. */
  onReorder?: (ids: string[]) => void;
  /** Shows a remove button on each item. */
  onRemove?: (id: string) => void;
  /** Shows "Clear completed"; called with the ids of the checked-off items. */
  onClearCompleted?: (ids: string[]) => void;
  /** The completed section starts open (default false). */
  completedOpen?: boolean;
  /** Reorder instructions and announcements. */
  messages?: Partial<ReorderMessages>;
  labels?: Partial<TodoListLabels>;
}

export interface TodoListHandle {
  el: HTMLElement;
  update(changes: Partial<TodoListOptions>): void;
  destroy(): void;
}

/** Open items in their order, then the checked-off ones. */
export function todoListView(items: readonly TodoItem[]): {
  open: TodoItem[];
  done: TodoItem[];
} {
  return {
    open: items.filter((i) => !i.done),
    done: items.filter((i) => i.done),
  };
}

export function todoItemClass(done: boolean): string {
  return cx('mh-reorder__item', 'mh-todo-list__item', done && 'is-done');
}

/**
 * Where focus goes after an item was checked or unchecked and its row moved: its own checkbox when it is shown,
 * else the checkbox now at its old place in the open list, else the completed toggle.
 */
export function todoListRefocus(root: HTMLElement, box: HTMLInputElement | null, at: number): void {
  if (box && !box.closest('[hidden]')) return box.focus();
  const open = root.querySelectorAll<HTMLInputElement>('.mh-todo-list__open .mh-checkbox__input');
  const next = open[Math.min(at, open.length - 1)];
  (next ?? root.querySelector<HTMLElement>('.mh-todo-list__toggle'))?.focus();
}

export const TODO_ADD_ICON = mdiPlus;
export const TODO_REMOVE_ICON = mdiClose;
export const TODO_TOGGLE_ICON = mdiChevronDown;
export const TODO_HANDLE_ICON = mdiDragVertical;

/**
 * `section.mh-todo-list`: an `__add` form (an `.mh-input` and a submit button), the open items as a reorderable
 * list (`.mh-reorder.__open`, the layout group's reordering: drag a handle, or Space and the arrows), `__empty`,
 * and a `__done` section whose `__toggle` (`aria-expanded`) shows the checked-off items beside "Clear completed".
 * Each `__item` (`.is-done`) has the reorder `__handle` (open items, with `onReorder`), a native checkbox
 * (`.mh-checkbox.__check`) whose label is the text and note, and a `__remove` button. Changes are announced.
 */
export function createTodoList(options: TodoListOptions): TodoListHandle {
  let o: TodoListOptions = { ...options };
  let completedOpen = o.completedOpen ?? false;
  const instructionsId = uid('mh-todo');
  const doneListId = uid('mh-todo-done');
  const el = h('section', { class: 'mh-todo-list' });
  const live = h('div', {
    class: 'mh-reorder__live mh-visually-hidden',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });
  const instructions = h('p', {
    class: 'mh-visually-hidden',
    id: instructionsId,
  });
  const openList = h('ul', { class: 'mh-reorder__list mh-todo-list__list' });
  const open = h('div', { class: 'mh-reorder mh-todo-list__open' }, openList, live);
  const empty = h('p', { class: 'mh-todo-list__empty' });
  const toggleText = h('span', { class: 'mh-todo-list__toggle-text' });
  const toggle = h(
    'button',
    {
      type: 'button',
      class: 'mh-todo-list__toggle',
      'aria-controls': doneListId,
    },
    createIcon(TODO_TOGGLE_ICON, { class: 'mh-todo-list__chevron' }),
    toggleText,
  );
  const doneList = h('ul', {
    class: 'mh-reorder__list mh-todo-list__list mh-todo-list__done-list',
    id: doneListId,
  });
  const doneHeader = h('div', { class: 'mh-todo-list__done-header' }, toggle);
  const done = h('div', { class: 'mh-todo-list__done' }, doneHeader, doneList);
  const input = h('input', {
    class: 'mh-input__control',
    type: 'text',
    autocomplete: 'off',
    enterkeyhint: 'done',
  });
  const addButton = h(
    'button',
    {
      type: 'submit',
      class: cx(iconButtonClass('accent', 'medium', true), 'mh-todo-list__add-button'),
    },
    createIcon(TODO_ADD_ICON),
  );
  const form = h('form', { class: 'mh-todo-list__add' }, h('div', { class: inputClass('medium', 'mh-todo-list__input') }, input), addButton);
  let clear: HTMLButtonElement | null = null;
  const rows = new Map<string, { li: HTMLLIElement; key: string }>();
  let refocus: { id: string; at: number } | null = null;

  const labels = (): TodoListLabels => ({ ...TODO_LIST_LABELS, ...o.labels });
  const announce = (text: string): void => {
    live.textContent = text;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    o.onAdd?.(text);
    input.value = '';
    announce(labels().added(text));
  });
  toggle.addEventListener('click', () => {
    completedOpen = !completedOpen;
    render();
  });

  const row = (item: TodoItem, L: TodoListLabels): HTMLLIElement => {
    const reorderable = !item.done && !!o.onReorder;
    const box = h('input', { type: 'checkbox', class: 'mh-checkbox__input' });
    box.checked = item.done;
    box.addEventListener('change', () => {
      const li = box.closest('li');
      refocus = {
        id: item.id,
        at: li ? Array.from(li.parentElement?.children ?? []).indexOf(li) : 0,
      };
      announce((box.checked ? L.checked : L.unchecked)(item.text));
      o.onToggle?.(item.id, box.checked);
    });
    const remove = o.onRemove
      ? h(
          'button',
          {
            type: 'button',
            class: cx(iconButtonClass('default', 'small'), 'mh-todo-list__remove'),
            'aria-label': L.remove(item.text),
            title: L.remove(item.text),
            onclick: () => o.onRemove?.(item.id),
          },
          createIcon(TODO_REMOVE_ICON),
        )
      : null;
    const m = { ...defaultReorderMessages, ...o.messages };
    return h(
      'li',
      { class: todoItemClass(item.done), 'data-id': item.id },
      reorderable
        ? h(
            'button',
            {
              type: 'button',
              class: 'mh-reorder__handle',
              'aria-label': m.handle(item.text),
              'aria-describedby': instructionsId,
              'aria-pressed': 'false',
            },
            createIcon(TODO_HANDLE_ICON),
          )
        : null,
      h(
        'label',
        { class: 'mh-checkbox mh-todo-list__check' },
        h('span', { class: 'mh-checkbox__control' }, box, createIcon(mdiCheck, { class: 'mh-checkbox__check' }), createIcon(mdiMinus, { class: 'mh-checkbox__dash' })),
        h(
          'span',
          { class: 'mh-checkbox__text' },
          h(
            'span',
            {
              class: 'mh-checkbox__label mh-reorder__label mh-todo-list__text',
            },
            item.text,
          ),
          item.note ? h('span', { class: 'mh-checkbox__description mh-todo-list__note' }, item.note) : null,
        ),
      ),
      remove,
    );
  };

  const rowsFor = (items: readonly TodoItem[], L: TodoListLabels): HTMLLIElement[] =>
    items.map((item) => {
      const key = JSON.stringify([item.text, item.done, item.note ?? null, !!o.onReorder, !!o.onRemove, o.labels ?? null, o.messages ?? null]);
      const had = rows.get(item.id);
      if (had && had.key === key) return had.li;
      const li = row(item, L);
      rows.set(item.id, { li, key });
      return li;
    });

  const render = (): void => {
    const L = labels();
    const view = todoListView(o.items);
    el.setAttribute('aria-label', o.label);
    openList.setAttribute('aria-label', o.label);
    instructions.textContent = {
      ...defaultReorderMessages,
      ...o.messages,
    }.instructions;
    input.setAttribute('aria-label', L.newItem);
    input.placeholder = L.newItem;
    addButton.setAttribute('aria-label', L.add);
    addButton.title = L.add;
    const ids = new Set(o.items.map((i) => i.id));
    for (const id of [...rows.keys()]) if (!ids.has(id)) rows.delete(id);
    syncChildren(openList, rowsFor(view.open, L));
    syncChildren(doneList, rowsFor(view.done, L));
    syncChildren(open, o.onReorder ? [instructions, openList, live] : [openList, live]);
    empty.textContent = view.done.length ? L.allDone : L.empty;
    toggleText.textContent = L.completed(view.done.length);
    toggle.setAttribute('aria-expanded', String(completedOpen));
    doneList.hidden = !completedOpen;
    doneList.setAttribute('aria-label', L.completed(view.done.length));
    if (o.onClearCompleted && view.done.length) {
      if (!clear) {
        clear = createButton({
          label: L.clearCompleted,
          variant: 'text',
          size: 'small',
          onClick: () => o.onClearCompleted?.(todoListView(o.items).done.map((i) => i.id)),
        }).el;
        clear.classList.add('mh-todo-list__clear');
      }
      clear.querySelector('.mh-button__label')!.textContent = L.clearCompleted;
      syncChildren(doneHeader, [toggle, clear]);
    } else syncChildren(doneHeader, [toggle]);
    syncChildren(el, [...(o.onAdd ? [form] : []), open, ...(view.open.length ? [] : [empty]), ...(view.done.length ? [done] : [])]);
    if (refocus !== null) {
      const r = refocus;
      refocus = null;
      if (!el.contains(document.activeElement)) todoListRefocus(el, rows.get(r.id)?.li.querySelector<HTMLInputElement>('.mh-checkbox__input') ?? null, r.at);
    }
  };

  render();
  const controller = bindReorderableList(open, {
    get messages() {
      return o.messages;
    },
    onMove: (from, to) => {
      const order = moveItem(
        Array.from(openList.children).map((r) => (r as HTMLElement).dataset.id ?? ''),
        from,
        to,
      );
      const moved = openList.children[from];
      if (!moved || from === to) return;
      const rest = Array.from(openList.children).filter((r) => r !== moved);
      openList.insertBefore(moved, rest[to] ?? null);
      o.onReorder?.(order);
    },
  });
  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      if ('completedOpen' in changes) completedOpen = changes.completedOpen ?? false;
      render();
    },
    destroy: () => controller.destroy(),
  };
}
