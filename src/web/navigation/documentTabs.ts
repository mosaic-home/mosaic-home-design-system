import { mdiClose, mdiPlus } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { tabsKeyTarget } from './tabs.ts';

export interface DocumentTab {
  id: string;
  label: string;
  icon?: IconName | string;
  /** Unsaved changes: a dot in place of the close button until it is hovered or focused. */
  dirty?: boolean;
  /** Default true. */
  closable?: boolean;
  /** A longer name for the tooltip and screen readers ("Scenes / Evening.yaml"). */
  title?: string;
}

export interface DocumentTabsOptions {
  tabs: readonly DocumentTab[];
  /** Selected tab id; default the first. */
  value?: string;
  /** Accessible name of the tab list. */
  label?: string;
  onChange?: (id: string) => void;
  /**
   * The user closed a tab (close button, middle click, Delete). Return false to keep it, e.g. to ask about unsaved
   * changes first and call `closeTab` later.
   */
  onClose?: (id: string) => unknown;
  /** Shows a "new tab" button at the end of the row. */
  onAdd?: () => void;
  addLabel?: string;
  /** Label of each close button; default "Close". */
  closeLabel?: string;
}

export interface DocumentTabsHandle {
  el: HTMLElement;
  value(): string;
  setValue(id: string): void;
  setTabs(tabs: readonly DocumentTab[]): void;
  setDirty(id: string, dirty: boolean): void;
  /** Removes a tab without asking (`onClose` isn't called); selects a neighbour if it was selected. */
  closeTab(id: string): void;
}

/** The tab that takes over when `closing` closes: the next one, else the previous; unchanged if another was selected. */
export function documentTabsAfterClose(tabs: readonly Pick<DocumentTab, 'id'>[], closing: string, current: string): string {
  if (closing !== current) return current;
  const i = tabs.findIndex((t) => t.id === closing);
  const rest = tabs.filter((t) => t.id !== closing);
  if (rest.length === 0) return '';
  return rest[Math.min(Math.max(i, 0), rest.length - 1)]!.id;
}

export function documentTabClass(selected: boolean, dirty = false): string {
  return cx('mh-document-tabs__tab', selected && 'is-selected', dirty && 'is-dirty');
}

/** Screen-reader text after the label of a tab with unsaved changes. */
export const DOCUMENT_TAB_DIRTY_TEXT = ', unsaved changes';

/**
 * `.mh-document-tabs`: a scrolling `role="tablist"` of `.mh-document-tabs__tab`s (`.is-selected`, `.is-dirty`), each
 * a `button.__select` (`role="tab"`, roving `tabindex`) and a `button.__close` (out of the tab order; Delete closes the
 * focused tab, middle click closes too). A dirty tab shows `__dirty`, a dot, until the close button is hovered or
 * focused. Optional `button.__add` after the list. Left and Right arrows, Home and End move between tabs.
 */
export function createDocumentTabs(options: DocumentTabsOptions): DocumentTabsHandle {
  const closeLabel = options.closeLabel ?? 'Close';
  const list = h('div', { class: 'mh-document-tabs__list', role: 'tablist', 'aria-label': options.label ?? null });
  const el = h('div', { class: 'mh-document-tabs' }, list);
  if (options.onAdd) {
    const addLabel = options.addLabel ?? 'New tab';
    const add = h('button', { type: 'button', class: 'mh-document-tabs__add', 'aria-label': addLabel, title: addLabel }, createIcon(mdiPlus));
    add.addEventListener('click', () => options.onAdd!());
    el.append(add);
  }
  let tabs = [...options.tabs];
  let current = tabs.find((t) => t.id === options.value)?.id ?? tabs[0]?.id ?? '';

  const buttons = (): HTMLButtonElement[] => Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

  function render(): void {
    const focused = buttons().findIndex((b) => b === document.activeElement);
    list.replaceChildren(
      ...tabs.map((tab) => {
        const on = tab.id === current;
        const closable = tab.closable ?? true;
        const select = h(
          'button',
          {
            type: 'button',
            class: 'mh-document-tabs__select',
            role: 'tab',
            'aria-selected': String(on),
            tabindex: on ? 0 : -1,
            title: tab.title ?? null,
          },
          tab.icon ? createIcon(tab.icon) : null,
          h('span', { class: 'mh-document-tabs__label' }, tab.label),
          tab.dirty ? h('span', { class: 'mh-visually-hidden' }, DOCUMENT_TAB_DIRTY_TEXT) : null,
        );
        select.addEventListener('click', () => choose(tab.id, true));
        const wrap = h('div', { class: documentTabClass(on, tab.dirty), role: 'presentation', 'data-id': tab.id }, select);
        if (closable) {
          const close = h(
            'button',
            { type: 'button', class: 'mh-document-tabs__close', tabindex: -1, 'aria-label': `${closeLabel} ${tab.label}`, title: closeLabel },
            tab.dirty ? h('span', { class: 'mh-document-tabs__dirty', 'aria-hidden': 'true' }) : null,
            createIcon(mdiClose, { class: 'mh-document-tabs__close-icon' }),
          );
          close.addEventListener('click', (e) => {
            e.stopPropagation();
            requestClose(tab.id);
          });
          wrap.append(close);
          wrap.addEventListener('auxclick', (e) => {
            if (e.button !== 1) return;
            e.preventDefault();
            requestClose(tab.id);
          });
        } else if (tab.dirty) {
          wrap.append(h('span', { class: 'mh-document-tabs__dirty', 'aria-hidden': 'true' }));
        }
        return wrap;
      }),
    );
    if (focused >= 0) {
      const all = buttons();
      all[Math.min(focused, all.length - 1)]?.focus();
    }
  }

  function choose(id: string, notify: boolean): void {
    if (id === current || !tabs.some((t) => t.id === id)) return;
    current = id;
    render();
    if (notify) options.onChange?.(current);
  }

  function remove(id: string, notify: boolean): void {
    if (!tabs.some((t) => t.id === id)) return;
    const next = documentTabsAfterClose(tabs, id, current);
    const changed = next !== current;
    const hadFocus = list.contains(document.activeElement);
    tabs = tabs.filter((t) => t.id !== id);
    current = next;
    render();
    if (hadFocus) buttons().find((b) => b.getAttribute('aria-selected') === 'true')?.focus();
    if (notify && changed && current) options.onChange?.(current);
  }

  function requestClose(id: string): void {
    if (options.onClose?.(id) === false) return;
    remove(id, true);
  }

  list.addEventListener('keydown', (e) => {
    const all = buttons();
    const from = all.indexOf(e.target as HTMLButtonElement);
    if (from < 0) return;
    if (e.key === 'Delete' && (tabs[from]!.closable ?? true)) {
      e.preventDefault();
      requestClose(tabs[from]!.id);
      return;
    }
    const to = tabsKeyTarget(tabs.map(() => ({})), from, e.key);
    if (to === null) return;
    e.preventDefault();
    choose(tabs[to]!.id, true);
    buttons()[to]?.focus();
  });

  render();
  return {
    el,
    value: () => current,
    setValue: (id) => choose(id, false),
    setTabs(next) {
      tabs = [...next];
      if (!tabs.some((t) => t.id === current)) current = tabs[0]?.id ?? '';
      render();
    },
    setDirty(id, dirty) {
      tabs = tabs.map((t) => (t.id === id ? { ...t, dirty } : t));
      render();
    },
    closeTab: (id) => remove(id, false),
  };
}
