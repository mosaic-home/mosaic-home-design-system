import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type TabsVariant = 'underline' | 'pill';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName | string;
  /** A count or short label after the text. */
  badge?: string | number;
  disabled?: boolean;
  /** Panel content; tabs without panels work as a switcher (`aria-controls` is left out). */
  panel?: Child | Child[];
}

export interface TabsOptions {
  tabs: readonly TabItem[];
  /** Selected tab id; default the first enabled tab. */
  value?: string;
  /** Default `underline`. */
  variant?: TabsVariant;
  /** Accessible name of the tab list. */
  label?: string;
  /** Tabs share the full width. */
  fill?: boolean;
  /** `auto` (default) selects as arrow keys move; `manual` waits for Enter or Space. */
  activation?: 'auto' | 'manual';
  onChange?: (id: string) => void;
}

export interface TabsHandle {
  el: HTMLElement;
  value(): string;
  setValue(id: string): void;
}

export function tabsClass(variant: TabsVariant = 'underline', fill = false): string {
  return cx('mh-tabs', `mh-tabs--${variant}`, fill && 'mh-tabs--fill');
}

/**
 * The tab a navigation key moves to, as an index into `tabs`, or null for other keys. Arrow keys wrap and skip
 * disabled tabs; Home and End go to the ends. Shared with the React binding.
 */
export function tabsKeyTarget(tabs: readonly Pick<TabItem, 'disabled'>[], from: number, key: string): number | null {
  const enabled = tabs.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
  if (enabled.length === 0) return null;
  const at = enabled.indexOf(from);
  switch (key) {
    case 'ArrowRight':
      return enabled[(at + 1) % enabled.length]!;
    case 'ArrowLeft':
      return enabled[(at - 1 + enabled.length) % enabled.length]!;
    case 'Home':
      return enabled[0]!;
    case 'End':
      return enabled[enabled.length - 1]!;
    default:
      return null;
  }
}

/** The tab selected for a value: the matching enabled tab, else the first enabled one. */
export function selectedTab(tabs: readonly Pick<TabItem, 'id' | 'disabled'>[], value: string | undefined): string {
  return tabs.find((t) => t.id === value && !t.disabled)?.id ?? tabs.find((t) => !t.disabled)?.id ?? '';
}

/**
 * `.mh-tabs` (`--underline | --pill`, `--fill`): a `role="tablist"` row of `.mh-tabs__tab` buttons
 * (`aria-selected`, roving `tabindex`) with optional `.mh-tabs__panel`s. Left and Right arrows, Home and End move
 * between tabs.
 */
export function createTabs(options: TabsOptions): TabsHandle {
  const base = uid('mh-tabs');
  const list = h('div', { class: 'mh-tabs__list', role: 'tablist', 'aria-label': options.label ?? null });
  const el = h('div', { class: tabsClass(options.variant, options.fill) }, list);
  const hasPanels = options.tabs.some((t) => t.panel !== undefined);
  const buttons: HTMLButtonElement[] = [];
  const panels: HTMLElement[] = [];
  let current = selectedTab(options.tabs, options.value);

  options.tabs.forEach((tab, i) => {
    const tabId = `${base}-tab-${i}`;
    const panelId = `${base}-panel-${i}`;
    const btn = h(
      'button',
      { type: 'button', class: 'mh-tabs__tab', role: 'tab', id: tabId, 'aria-controls': hasPanels ? panelId : null, disabled: tab.disabled ?? false },
      tab.icon ? createIcon(tab.icon) : null,
      h('span', { class: 'mh-tabs__label' }, tab.label),
      tab.badge !== undefined ? h('span', { class: 'mh-tabs__badge' }, String(tab.badge)) : null,
    );
    btn.addEventListener('click', () => select(tab.id, true));
    buttons.push(btn);
    list.append(btn);
    if (hasPanels) {
      const panel = h('div', { class: 'mh-tabs__panel', role: 'tabpanel', id: panelId, 'aria-labelledby': tabId, tabindex: 0 });
      append(panel, ...(Array.isArray(tab.panel) ? tab.panel : [tab.panel]));
      panels.push(panel);
      el.append(panel);
    }
  });

  function sync(): void {
    options.tabs.forEach((tab, i) => {
      const on = tab.id === current;
      buttons[i]!.setAttribute('aria-selected', String(on));
      buttons[i]!.tabIndex = on ? 0 : -1;
      if (panels[i]) panels[i]!.hidden = !on;
    });
  }

  function select(id: string, notify: boolean): void {
    const next = selectedTab(options.tabs, id);
    if (next === current) return;
    current = next;
    sync();
    if (notify) options.onChange?.(current);
  }

  list.addEventListener('keydown', (e) => {
    const from = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (from < 0) return;
    const to = tabsKeyTarget(options.tabs, from, e.key);
    if (to === null) return;
    e.preventDefault();
    buttons[to]!.focus();
    if ((options.activation ?? 'auto') === 'auto') select(options.tabs[to]!.id, true);
    else for (const [i, b] of buttons.entries()) b.tabIndex = i === to ? 0 : -1;
  });

  sync();
  return {
    el,
    value: () => current,
    setValue: (id) => select(id, false),
  };
}
