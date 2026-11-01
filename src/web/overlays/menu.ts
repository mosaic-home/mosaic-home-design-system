import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { overlayHost, placeFloating, type FloatingPlacement } from './layer.ts';

export interface MenuItem {
  value: string;
  label: string;
  icon?: IconName | string;
  /** Shown on the right, e.g. "Ctrl+D". Display only. */
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
}

export interface MenuSeparator {
  separator: true;
}

export type MenuEntry = MenuItem | MenuSeparator;

export type MenuPlacement = Extract<FloatingPlacement, 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'>;

export interface MenuOptions {
  /** The button that opens the menu; it gets `aria-haspopup`, `aria-expanded` and `aria-controls`. */
  anchor: HTMLElement;
  items: readonly MenuEntry[];
  onSelect?: (value: string) => void;
  /** Default `bottom-start`; flips when there's no room. */
  placement?: MenuPlacement;
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default: the anchor's). */
  container?: HTMLElement | null;
}

export interface MenuHandle {
  el: HTMLElement;
  open(focus?: 'first' | 'last'): void;
  close(): void;
  isOpen(): boolean;
  setItems(items: readonly MenuEntry[]): void;
  /** Detaches the menu and its listeners from the anchor. */
  destroy(): void;
}

const isItem = (e: MenuEntry): e is MenuItem => !('separator' in e);

export function menuItemClass(item: MenuItem): string {
  return cx('mh-menu__item', item.danger && 'mh-menu__item--danger');
}

/**
 * `.mh-menu` (`role="menu"`): a list of `.mh-menu__item` actions (`--danger`, `aria-disabled`) and
 * `.mh-menu__separator`s, anchored to a button. Arrow keys, Home and End move a roving focus, typing a letter jumps
 * to the next item starting with it, Enter or Space chooses, Escape closes back to the button, Tab closes.
 */
export function createMenu(options: MenuOptions): MenuHandle {
  const anchor = options.anchor;
  if (!anchor.id) anchor.id = uid('mh-menu-button');
  const el = h('div', { class: 'mh-menu', role: 'menu', id: uid('mh-menu'), 'aria-labelledby': anchor.id, tabindex: -1 });
  anchor.setAttribute('aria-haspopup', 'menu');
  anchor.setAttribute('aria-expanded', 'false');
  let items: HTMLButtonElement[] = [];
  let opened = false;

  const render = (entries: readonly MenuEntry[]): void => {
    items = [];
    el.replaceChildren(
      ...entries.map((entry) => {
        if (!isItem(entry)) return h('div', { class: 'mh-menu__separator', role: 'separator' });
        const btn = h(
          'button',
          { type: 'button', class: menuItemClass(entry), role: 'menuitem', tabindex: -1, 'aria-disabled': entry.disabled ? 'true' : null, 'data-value': entry.value },
          entry.icon ? createIcon(entry.icon, { class: 'mh-menu__icon' }) : null,
          h('span', { class: 'mh-menu__label' }, entry.label),
          entry.shortcut ? h('kbd', { class: 'mh-menu__shortcut' }, entry.shortcut) : null,
        );
        btn.addEventListener('click', () => {
          if (entry.disabled) return;
          close(true);
          options.onSelect?.(entry.value);
        });
        items.push(btn);
        return btn;
      }),
    );
  };

  const enabled = (): HTMLButtonElement[] => items.filter((b) => b.getAttribute('aria-disabled') !== 'true');
  const focusItem = (btn: HTMLButtonElement | undefined): void => {
    if (!btn) return;
    for (const b of items) b.tabIndex = b === btn ? 0 : -1;
    btn.focus({ preventScroll: true });
  };
  const place = (): void => placeFloating(el, anchor, options.placement ?? 'bottom-start', 4);

  const onOutside = (e: Event): void => {
    const t = e.target as Node;
    if (!el.contains(t) && !anchor.contains(t)) close(false);
  };
  const onViewport = (): void => {
    if (opened) place();
  };

  function open(focus: 'first' | 'last' = 'first'): void {
    if (!opened) {
      opened = true;
      overlayHost(options.container ?? anchor).append(el);
      anchor.setAttribute('aria-expanded', 'true');
      anchor.setAttribute('aria-controls', el.id);
      place();
      document.addEventListener('pointerdown', onOutside, true);
      window.addEventListener('resize', onViewport);
      window.addEventListener('scroll', onViewport, true);
    }
    const list = enabled();
    focusItem(focus === 'first' ? list[0] : list[list.length - 1]);
    if (list.length === 0) el.focus({ preventScroll: true });
  }

  function close(refocus: boolean): void {
    if (!opened) return;
    opened = false;
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onViewport);
    window.removeEventListener('scroll', onViewport, true);
    anchor.setAttribute('aria-expanded', 'false');
    anchor.removeAttribute('aria-controls');
    const hadFocus = el.contains(document.activeElement);
    el.remove();
    if (refocus || hadFocus) anchor.focus({ preventScroll: true });
  }

  const onAnchorClick = (): void => (opened ? close(true) : open('first'));
  const onAnchorKey = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open(e.key === 'ArrowDown' ? 'first' : 'last');
    }
  };
  anchor.addEventListener('click', onAnchorClick);
  anchor.addEventListener('keydown', onAnchorKey);

  el.addEventListener('keydown', (e) => {
    const list = enabled();
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem(list[(i + 1) % list.length]);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem(list[(i - 1 + list.length) % list.length]);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(list[0]);
        break;
      case 'End':
        e.preventDefault();
        focusItem(list[list.length - 1]);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        close(true);
        break;
      case 'Tab':
        // Back to the button first, so Tab carries on from there in the page order.
        close(true);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const ch = e.key.toLowerCase();
          const n = list.length;
          for (let k = 1; k <= n; k += 1) {
            const cand = list[(i + k + n) % n]!;
            if (cand.textContent?.trim().toLowerCase().startsWith(ch)) {
              focusItem(cand);
              break;
            }
          }
        }
    }
  });
  el.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (opened && next && !el.contains(next) && next !== anchor) close(false);
  });

  render(options.items);
  return {
    el,
    open,
    close: () => close(true),
    isOpen: () => opened,
    setItems: render,
    destroy() {
      close(false);
      anchor.removeEventListener('click', onAnchorClick);
      anchor.removeEventListener('keydown', onAnchorKey);
      anchor.removeAttribute('aria-haspopup');
      anchor.removeAttribute('aria-expanded');
    },
  };
}
