import { append, cx, h, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

/** A count, `'dot'` for "something new", or a short label. */
export type NavRailBadge = number | 'dot' | string;

export interface NavRailItem {
  id: string;
  label: string;
  icon: IconName | string;
  /** Icon while selected (a filled variant). */
  iconSelected?: IconName | string;
  badge?: NavRailBadge | null;
  /** Spoken with the badge ("3 unread"); default the count, or "new" for a dot. */
  badgeLabel?: string;
  href?: string;
  disabled?: boolean;
}

export interface NavRailOptions {
  items: readonly NavRailItem[];
  /** Items pinned to the bottom (settings, profile). */
  footerItems?: readonly NavRailItem[];
  /** Selected id. */
  value?: string;
  /** Accessible name of the navigation; default "Main". */
  label?: string;
  /** Labels beside the icons in a wider rail, instead of under them. */
  expanded?: boolean;
  /** `all` (default) shows every label; `selected` only the current one's; `none` hides them (still read out). */
  labels?: 'all' | 'selected' | 'none';
  /** Content above the items: a menu button, a primary action. */
  header?: Child | Child[];
  onChange?: (id: string) => void;
}

export interface NavRailHandle {
  el: HTMLElement;
  value(): string;
  setValue(id: string): void;
  setBadge(id: string, badge: NavRailBadge | null): void;
  setExpanded(expanded: boolean): void;
}

export function navRailClass(expanded = false, labels: 'all' | 'selected' | 'none' = 'all'): string {
  return cx('mh-nav-rail', expanded && 'mh-nav-rail--expanded', labels !== 'all' && `mh-nav-rail--labels-${labels}`);
}

/** Visible badge text: counts above 99 read "99+", a dot shows nothing. */
export function navRailBadgeText(badge: NavRailBadge): string {
  if (badge === 'dot') return '';
  if (typeof badge === 'number') return badge > 99 ? '99+' : String(Math.max(0, Math.floor(badge)));
  return badge;
}

/** Whether a badge shows at all (zero counts and empty labels don't). */
export const navRailBadgeShown = (badge: NavRailBadge | null | undefined): badge is NavRailBadge =>
  badge !== null && badge !== undefined && badge !== '' && !(typeof badge === 'number' && badge <= 0);

/** The badge's screen-reader text, after the label. */
export function navRailBadgeLabel(badge: NavRailBadge, label?: string): string {
  if (label) return `, ${label}`;
  return badge === 'dot' ? ', new' : `, ${navRailBadgeText(badge)}`;
}

export function navRailBadgeClass(badge: NavRailBadge): string {
  return cx('mh-nav-rail__badge', badge === 'dot' && 'mh-nav-rail__badge--dot');
}

/**
 * `nav.mh-nav-rail` (`--expanded`, `--labels-selected | --labels-none`): an optional `__header`, then
 * `ul.mh-nav-rail__list` (and a `--footer` list) of `a | button.mh-nav-rail__item` (`aria-current="page"` on the
 * selected one). Each item has an `__indicator` pill around the icon with an optional `__badge` (`--dot`), and a
 * `__label`. Native links and buttons, so Tab and Enter work as everywhere else.
 */
export function createNavRail(options: NavRailOptions): NavRailHandle {
  const labels = options.labels ?? 'all';
  const el = h('nav', { class: navRailClass(options.expanded, labels), 'aria-label': options.label ?? 'Main' });
  let current = options.value ?? '';
  const badges = new Map<string, NavRailBadge | null>();
  const nodes = new Map<string, { item: NavRailItem; el: HTMLElement; icon: HTMLElement; badge: HTMLElement }>();

  if (options.header !== undefined) {
    const header = h('div', { class: 'mh-nav-rail__header' });
    append(header, ...(Array.isArray(options.header) ? options.header : [options.header]));
    el.append(header);
  }

  const build = (items: readonly NavRailItem[], footer: boolean): HTMLUListElement => {
    const list = h('ul', { class: cx('mh-nav-rail__list', footer && 'mh-nav-rail__list--footer') });
    for (const item of items) {
      badges.set(item.id, item.badge ?? null);
      const icon = h('span', { class: 'mh-nav-rail__icon' });
      const badge = h('span', { class: 'mh-nav-rail__badge-slot' });
      const indicator = h('span', { class: 'mh-nav-rail__indicator', 'aria-hidden': 'true' }, icon, badge);
      const content = [indicator, h('span', { class: 'mh-nav-rail__label' }, item.label)];
      const node: HTMLElement = item.href !== undefined && !item.disabled
        ? h('a', { class: 'mh-nav-rail__item', href: item.href }, ...content)
        : item.href !== undefined
          ? h('a', { class: 'mh-nav-rail__item', role: 'link', 'aria-disabled': 'true' }, ...content)
          : h('button', { type: 'button', class: 'mh-nav-rail__item', disabled: item.disabled ?? false }, ...content);
      if (!item.disabled) {
        node.addEventListener('click', (e) => {
          if (item.href !== undefined && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
          select(item.id, true);
        });
      }
      nodes.set(item.id, { item, el: node, icon, badge });
      list.append(h('li', { class: 'mh-nav-rail__entry' }, node));
    }
    return list;
  };

  el.append(build(options.items, false));
  if (options.footerItems?.length) el.append(build(options.footerItems, true));

  function syncItem(id: string): void {
    const n = nodes.get(id);
    if (!n) return;
    const on = id === current;
    if (on) n.el.setAttribute('aria-current', 'page');
    else n.el.removeAttribute('aria-current');
    n.icon.replaceChildren(createIcon(on && n.item.iconSelected ? n.item.iconSelected : n.item.icon));
    const badge = badges.get(id);
    // The visible badge sits in the decorative indicator; the spoken text follows the label.
    n.badge.replaceChildren(...(navRailBadgeShown(badge) ? [h('span', { class: navRailBadgeClass(badge) }, navRailBadgeText(badge))] : []));
    n.el.querySelector('.mh-nav-rail__label + .mh-visually-hidden')?.remove();
    if (navRailBadgeShown(badge)) n.el.append(h('span', { class: 'mh-visually-hidden' }, navRailBadgeLabel(badge, n.item.badgeLabel)));
  }

  function select(id: string, notify: boolean): void {
    if (id === current || !nodes.has(id)) return;
    const previous = current;
    current = id;
    syncItem(previous);
    syncItem(id);
    if (notify) options.onChange?.(id);
  }

  for (const id of nodes.keys()) syncItem(id);
  return {
    el,
    value: () => current,
    setValue: (id) => select(id, false),
    setBadge(id, badge) {
      badges.set(id, badge);
      syncItem(id);
    },
    setExpanded(expanded) {
      el.classList.toggle('mh-nav-rail--expanded', expanded);
    },
  };
}
