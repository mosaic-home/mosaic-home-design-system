import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type StatusBarTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export interface StatusBarItem {
  id: string;
  /** Visible text ("Connected", "3 updates"). */
  label: string;
  /** A value after the label, in the mono face ("21.5°", "14:02"). */
  value?: string;
  icon?: IconName | string;
  tone?: StatusBarTone;
  /** A fuller description, as a tooltip and the accessible description. */
  title?: string;
  /** Sits at the far end of the bar. */
  end?: boolean;
  /** Screen readers hear changes to this item (`aria-live="polite"`). */
  announce?: boolean;
  /** The item becomes a button. */
  onClick?: (event: MouseEvent) => void;
}

export interface StatusBarOptions {
  /** Accessible name (default "Status"). */
  label?: string;
  items: readonly StatusBarItem[];
  /** Pins the bar to the bottom of a positioned container (default: in flow). */
  sticky?: boolean;
}

export interface StatusBarHandle {
  el: HTMLElement;
  /** Changes one item in place (label, value, icon, tone, title). */
  setItem(id: string, patch: Partial<Omit<StatusBarItem, 'id' | 'end' | 'onClick' | 'announce'>>): void;
}

export function statusBarClass(sticky = false): string {
  return cx('mh-status-bar', sticky && 'mh-status-bar--sticky');
}

export function statusBarItemClass(tone: StatusBarTone = 'default', interactive = false): string {
  return cx('mh-status-bar__item', tone !== 'default' && `mh-status-bar__item--${tone}`, interactive && 'mh-status-bar__item--interactive');
}

function itemParts(item: Omit<StatusBarItem, 'id'>): (Node | null)[] {
  return [
    item.icon ? createIcon(item.icon, { class: 'mh-status-bar__icon' }) : null,
    h('span', { class: 'mh-status-bar__label' }, item.label),
    item.value !== undefined ? h('span', { class: 'mh-status-bar__value' }, item.value) : null,
  ];
}

/**
 * `.mh-status-bar` (`--sticky`): a slim `footer` bar of status items in a `__start` and an `__end` group. Each
 * `__item` (`--accent | --success | --warning | --danger`, `--interactive` when it is a button) has an `__icon`,
 * a `__label` and a mono `__value`.
 */
export function createStatusBar(options: StatusBarOptions): StatusBarHandle {
  const start = h('div', { class: 'mh-status-bar__start' });
  const end = h('div', { class: 'mh-status-bar__end' });
  const el = h('footer', { class: statusBarClass(options.sticky), 'aria-label': options.label ?? 'Status' }, start, end);
  const nodes = new Map<string, HTMLElement>();
  const state = new Map<string, StatusBarItem>();

  for (const item of options.items) {
    const node = item.onClick
      ? h('button', { type: 'button', class: statusBarItemClass(item.tone, true), title: item.title, 'aria-live': item.announce ? 'polite' : null }, ...itemParts(item))
      : h('span', { class: statusBarItemClass(item.tone), title: item.title, 'aria-live': item.announce ? 'polite' : null }, ...itemParts(item));
    if (item.onClick) node.addEventListener('click', item.onClick as EventListener);
    nodes.set(item.id, node);
    state.set(item.id, item);
    (item.end ? end : start).append(node);
  }

  return {
    el,
    setItem(id, patch) {
      const node = nodes.get(id);
      const prev = state.get(id);
      if (!node || !prev) return;
      const next = { ...prev, ...patch };
      state.set(id, next);
      node.className = statusBarItemClass(next.tone, Boolean(next.onClick));
      if (next.title) node.title = next.title;
      else node.removeAttribute('title');
      node.replaceChildren(...itemParts(next).filter((n): n is Node => n !== null));
    },
  };
}
