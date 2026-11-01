import { mdiChevronDown } from '@mdi/js';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface PanelGroupItem {
  id: string;
  label: string;
  icon?: IconName | string;
  /** A count or short label after the tab text. */
  badge?: string | number;
  disabled?: boolean;
  content?: Child | Child[];
}

export interface PanelGroupOptions {
  panels: readonly PanelGroupItem[];
  /** Selected panel id; default the first enabled one. */
  value?: string;
  /** Accessible name of the tab list. */
  label?: string;
  /** Elements at the end of the tab bar (icon buttons). */
  actions?: HTMLElement[];
  /** A button at the end of the bar folds the dock down to its tabs. */
  collapsible?: boolean;
  collapsed?: boolean;
  /** Label of the fold button (default "Collapse panels" / "Expand panels"). */
  collapseLabel?: string;
  expandLabel?: string;
  /** Body without padding. */
  flush?: boolean;
  onChange?: (id: string) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export interface PanelGroupHandle {
  el: HTMLDivElement;
  value(): string;
  setValue(id: string): void;
  collapsed(): boolean;
  setCollapsed(collapsed: boolean): void;
}

export function panelGroupClass(flush = false): string {
  return cx('mh-panel-group', flush && 'mh-panel-group--flush');
}

/** The selected panel for a value: the matching enabled panel, else the first enabled one. */
export function panelGroupSelected(panels: readonly Pick<PanelGroupItem, 'id' | 'disabled'>[], value: string | undefined): string {
  return panels.find((p) => p.id === value && !p.disabled)?.id ?? panels.find((p) => !p.disabled)?.id ?? '';
}

/**
 * The tab a key moves focus to, as an index, or null for other keys. Left and Right (and Up and Down) wrap and
 * skip disabled tabs; Home and End go to the ends. Shared with the React binding.
 */
export function panelGroupKeyTarget(panels: readonly Pick<PanelGroupItem, 'disabled'>[], from: number, key: string): number | null {
  const enabled = panels.map((p, i) => (p.disabled ? -1 : i)).filter((i) => i >= 0);
  if (enabled.length === 0) return null;
  const at = Math.max(0, enabled.indexOf(from));
  if (key === 'ArrowRight' || key === 'ArrowDown') return enabled[(at + 1) % enabled.length]!;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return enabled[(at - 1 + enabled.length) % enabled.length]!;
  if (key === 'Home') return enabled[0]!;
  if (key === 'End') return enabled[enabled.length - 1]!;
  return null;
}

const list = (c: Child | Child[] | undefined): Child[] => (Array.isArray(c) ? c : c === undefined ? [] : [c]);

/**
 * `.mh-panel-group` (`--flush`; `.is-collapsed`): a dock of panels behind a compact tab bar (`__bar` with a
 * `role="tablist"` `__tabs` of `__tab` buttons, `__actions` and an optional `__fold` button) and one
 * `role="tabpanel"` `__panel` per entry. Arrows, Home and End move between tabs; selecting a tab of a folded dock
 * opens it.
 */
export function createPanelGroup(options: PanelGroupOptions): PanelGroupHandle {
  const base = uid('mh-panel-group');
  const tabs = h('div', { class: 'mh-panel-group__tabs', role: 'tablist', 'aria-label': options.label });
  const buttons: HTMLButtonElement[] = [];
  const panels: HTMLDivElement[] = [];
  let current = panelGroupSelected(options.panels, options.value);
  let collapsed = Boolean(options.collapsible && options.collapsed);

  const fold = options.collapsible
    ? h('button', { type: 'button', class: 'mh-panel-group__fold', 'aria-controls': options.panels.map((_, i) => `${base}-panel-${i}`).join(' ') }, createIcon(mdiChevronDown))
    : null;
  const actions = options.actions?.length || fold ? h('div', { class: 'mh-panel-group__actions' }, ...(options.actions ?? []), fold) : null;
  const el = h('div', { class: panelGroupClass(options.flush) }, h('div', { class: 'mh-panel-group__bar' }, tabs, actions));

  options.panels.forEach((panel, i) => {
    const tabId = `${base}-tab-${i}`;
    const panelId = `${base}-panel-${i}`;
    const btn = h(
      'button',
      { type: 'button', class: 'mh-panel-group__tab', role: 'tab', id: tabId, 'aria-controls': panelId, disabled: panel.disabled ?? false },
      panel.icon ? createIcon(panel.icon) : null,
      h('span', { class: 'mh-panel-group__label' }, panel.label),
      panel.badge !== undefined ? h('span', { class: 'mh-panel-group__badge' }, String(panel.badge)) : null,
    );
    btn.addEventListener('click', () => {
      select(panel.id, true);
      setCollapsed(false, true);
    });
    buttons.push(btn);
    tabs.append(btn);
    const body = h('div', { class: 'mh-panel-group__panel', role: 'tabpanel', id: panelId, 'aria-labelledby': tabId, tabindex: 0 });
    append(body, ...list(panel.content));
    panels.push(body);
    el.append(body);
  });

  function sync(): void {
    options.panels.forEach((panel, i) => {
      const on = panel.id === current;
      buttons[i]!.setAttribute('aria-selected', String(on));
      buttons[i]!.tabIndex = on ? 0 : -1;
      panels[i]!.hidden = !on || collapsed;
    });
    el.classList.toggle('is-collapsed', collapsed);
    if (fold) {
      const label = collapsed ? (options.expandLabel ?? 'Expand panels') : (options.collapseLabel ?? 'Collapse panels');
      fold.setAttribute('aria-expanded', String(!collapsed));
      fold.setAttribute('aria-label', label);
      fold.title = label;
    }
  }

  function select(id: string, notify: boolean): void {
    const next = panelGroupSelected(options.panels, id);
    if (next === current) return;
    current = next;
    sync();
    if (notify) options.onChange?.(current);
  }

  function setCollapsed(value: boolean, notify: boolean): void {
    if (!options.collapsible || value === collapsed) return;
    collapsed = value;
    sync();
    if (notify) options.onCollapse?.(collapsed);
  }

  fold?.addEventListener('click', () => setCollapsed(!collapsed, true));
  tabs.addEventListener('keydown', (e) => {
    const from = buttons.indexOf(e.target as HTMLButtonElement);
    if (from < 0) return;
    const to = panelGroupKeyTarget(options.panels, from, e.key);
    if (to === null) return;
    e.preventDefault();
    buttons[to]!.focus();
    select(options.panels[to]!.id, true);
  });

  sync();
  return {
    el,
    value: () => current,
    setValue: (id) => select(id, false),
    collapsed: () => collapsed,
    setCollapsed: (value) => setCollapsed(value, false),
  };
}
