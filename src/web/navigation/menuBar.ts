import { mdiCheck, mdiChevronRight } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface MenuBarItem {
  value: string;
  label: string;
  icon?: IconName | string;
  /** Shown at the end ("Ctrl+S"); also exposed as `aria-keyshortcuts`. Display only: the app handles the keys. */
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  /** A checkable item (`menuitemcheckbox`) when set. */
  checked?: boolean;
  /** A submenu. */
  items?: readonly MenuBarEntry[];
}

export interface MenuBarSeparator {
  separator: true;
}

export type MenuBarEntry = MenuBarItem | MenuBarSeparator;

export interface MenuBarMenu {
  label: string;
  items: readonly MenuBarEntry[];
  disabled?: boolean;
}

export interface MenuBarOptions {
  menus: readonly MenuBarMenu[];
  /** Accessible name of the bar ("Editor"). */
  label?: string;
  /** An item was chosen; for a checkable one, `checked` is its new state. */
  onSelect?: (value: string, checked?: boolean) => void;
}

export interface MenuBarHandle {
  el: HTMLElement;
  /** Closes any open menu. */
  close(): void;
  setChecked(value: string, checked: boolean): void;
  setDisabled(value: string, disabled: boolean): void;
  /** Removes the document listeners (and the content, when built into an existing element). */
  destroy(): void;
}

export const isMenuBarItem = (e: MenuBarEntry): e is MenuBarItem => !('separator' in e);

/** `aria-keyshortcuts` for a display shortcut: "Ctrl+Shift+S" → "Control+Shift+S", "Cmd+K" → "Meta+K". */
export function menuBarKeyShortcuts(shortcut: string): string {
  const names: Record<string, string> = { ctrl: 'Control', control: 'Control', cmd: 'Meta', command: 'Meta', '⌘': 'Meta', opt: 'Alt', option: 'Alt', alt: 'Alt', shift: 'Shift', del: 'Delete', esc: 'Escape' };
  return shortcut
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => names[part.toLowerCase()] ?? part)
    .join('+');
}

export function menuBarItemClass(item: MenuBarItem): string {
  return cx('mh-menu-bar__item', item.danger && 'mh-menu-bar__item--danger', item.items && 'mh-menu-bar__item--submenu');
}

/** Index of the next item a key moves to inside a menu (Up / Down wrap, Home, End), skipping nothing: disabled items stay focusable. */
export function menuBarMoveTarget(count: number, from: number, key: string): number | null {
  if (count === 0) return null;
  switch (key) {
    case 'ArrowDown':
      return (from + 1) % count;
    case 'ArrowUp':
      return from < 0 ? count - 1 : (from - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

interface Level {
  popup: HTMLElement;
  /** Focusable items, in order. */
  items: HTMLElement[];
  /** The trigger or submenu item that opens it. */
  opener: HTMLElement;
  parent: Level | null;
  /** Index of the top-level menu it belongs to. */
  top: number;
}

interface ItemInfo {
  item: MenuBarItem;
  level: Level;
  sub: Level | null;
}

/**
 * `.mh-menu-bar` (`role="menubar"`): `.mh-menu-bar__menu`s, each a `button.mh-menu-bar__trigger`
 * (`role="menuitem"`, `aria-haspopup`, `aria-expanded`, roving `tabindex`) and a `.mh-menu-bar__popup`
 * (`role="menu"`) of `.mh-menu-bar__item`s (`menuitem`, or `menuitemcheckbox` with `aria-checked`; `--danger`,
 * `--submenu` with a nested `__popup--sub`), `__separator`s, leading `__lead` (icon or check), `__label` and
 * `__shortcut`. Keyboard: Left / Right across the bar (an open menu follows), Down / Up / Enter / Space open,
 * arrows, Home, End and typing a letter move inside, Right / Left enter and leave submenus, Escape closes one
 * level, Tab closes all. Pointer: click opens, hovering moves between open menus and opens submenus.
 *
 * Pass `root` to build into an existing element (the React binding does).
 */
export function createMenuBar(options: MenuBarOptions, root?: HTMLElement): MenuBarHandle {
  const el = root ?? h('div');
  el.classList.add('mh-menu-bar');
  el.setAttribute('role', 'menubar');
  if (options.label) el.setAttribute('aria-label', options.label);
  const base = uid('mh-menu-bar');
  const triggers: HTMLButtonElement[] = [];
  const tops: Level[] = [];
  const menuEls: HTMLElement[] = [];
  const info = new Map<HTMLElement, ItemInfo>();
  const byValue = new Map<string, HTMLElement>();
  let open: Level[] = [];
  let tabStop = 0;
  let typed = '';
  let typedAt = 0;
  // Every listener goes through this signal, so `destroy` detaches them all (the React binding rebuilds in place).
  const listeners = new AbortController();
  const signal = listeners.signal;

  function buildPopup(entries: readonly MenuBarEntry[], opener: HTMLElement, parent: Level | null, top: number, sub: boolean): Level {
    const popup = h('div', { class: cx('mh-menu-bar__popup', sub && 'mh-menu-bar__popup--sub'), role: 'menu', 'aria-labelledby': opener.id, id: uid(`${base}-menu`) });
    popup.hidden = true;
    const level: Level = { popup, items: [], opener, parent, top };
    const lead = entries.some((e) => isMenuBarItem(e) && (e.icon || e.checked !== undefined));
    for (const entry of entries) {
      if (!isMenuBarItem(entry)) {
        popup.append(h('div', { class: 'mh-menu-bar__separator', role: 'separator' }));
        continue;
      }
      const checkable = entry.checked !== undefined;
      const itemEl = h(
        'div',
        {
          class: menuBarItemClass(entry),
          role: checkable ? 'menuitemcheckbox' : 'menuitem',
          id: uid(`${base}-item`),
          tabindex: -1,
          'aria-checked': checkable ? String(entry.checked) : null,
          'aria-disabled': entry.disabled ? 'true' : null,
          'aria-haspopup': entry.items ? 'menu' : null,
          'aria-expanded': entry.items ? 'false' : null,
          'aria-keyshortcuts': entry.shortcut ? menuBarKeyShortcuts(entry.shortcut) : null,
        },
        lead
          ? h('span', { class: 'mh-menu-bar__lead', 'aria-hidden': 'true' }, checkable ? createIcon(mdiCheck, { class: 'mh-menu-bar__check' }) : entry.icon ? createIcon(entry.icon) : null)
          : null,
        h('span', { class: 'mh-menu-bar__label' }, entry.label),
        entry.shortcut ? h('span', { class: 'mh-menu-bar__shortcut', 'aria-hidden': 'true' }, entry.shortcut) : null,
        entry.items ? createIcon(mdiChevronRight, { class: 'mh-menu-bar__chevron' }) : null,
      );
      const wrap = h('div', { class: 'mh-menu-bar__entry', role: 'none' }, itemEl);
      const sublevel = entry.items ? buildPopup(entry.items, itemEl, level, top, true) : null;
      if (sublevel) wrap.append(sublevel.popup);
      info.set(itemEl, { item: entry, level, sub: sublevel });
      byValue.set(entry.value, itemEl);
      level.items.push(itemEl);
      popup.append(wrap);
    }
    return level;
  }

  options.menus.forEach((menu, i) => {
    const trigger = h(
      'button',
      {
        type: 'button',
        class: 'mh-menu-bar__trigger',
        role: 'menuitem',
        id: `${base}-trigger-${i}`,
        'aria-haspopup': 'menu',
        'aria-expanded': 'false',
        'aria-disabled': menu.disabled ? 'true' : null,
        tabindex: i === 0 ? 0 : -1,
      },
      menu.label,
    );
    const level = buildPopup(menu.items, trigger, null, i, false);
    const wrap = h('div', { class: 'mh-menu-bar__menu', role: 'none' }, trigger, level.popup);
    triggers.push(trigger);
    tops.push(level);
    menuEls.push(wrap);
    el.append(wrap);
  });

  const isOpen = (level: Level): boolean => open.includes(level);

  function setTabStop(i: number): void {
    tabStop = i;
    triggers.forEach((t, j) => (t.tabIndex = j === i ? 0 : -1));
  }

  function showLevel(level: Level): void {
    level.popup.hidden = false;
    level.opener.setAttribute('aria-expanded', 'true');
    (level.parent ? level.opener.parentElement! : menuEls[level.top]!).classList.add('is-open');
    // Flip a popup that would leave the viewport to the other side of its opener.
    level.popup.classList.remove('is-flipped');
    const rect = level.popup.getBoundingClientRect();
    const width = document.documentElement.clientWidth || window.innerWidth;
    if (rect.width > 0 && rect.right > width) level.popup.classList.add('is-flipped');
  }

  function hideLevel(level: Level): void {
    level.popup.hidden = true;
    level.opener.setAttribute('aria-expanded', 'false');
    (level.parent ? level.opener.parentElement! : menuEls[level.top]!).classList.remove('is-open');
  }

  /** Closes `level` and everything opened from it. */
  function closeFrom(level: Level): void {
    const at = open.indexOf(level);
    if (at < 0) return;
    for (const l of open.slice(at).reverse()) hideLevel(l);
    open = open.slice(0, at);
  }

  function closeAll(focusTrigger = false): void {
    const top = open[0];
    if (top) closeFrom(top);
    if (focusTrigger && top) triggers[top.top]!.focus();
  }

  function focusItem(level: Level, index: number): void {
    level.items[index]?.focus();
  }

  function openTop(i: number, focus: 'first' | 'last' | 'none'): void {
    if (options.menus[i]!.disabled) return;
    const level = tops[i]!;
    if (!isOpen(level)) {
      closeAll();
      open = [level];
      showLevel(level);
    } else if (open.length > 1) {
      closeFrom(open[1]!);
    }
    setTabStop(i);
    if (focus === 'first') focusItem(level, 0);
    else if (focus === 'last') focusItem(level, level.items.length - 1);
  }

  function openSub(itemEl: HTMLElement, focusFirst: boolean): void {
    const data = info.get(itemEl);
    if (!data?.sub || data.item.disabled) return;
    // Close sibling submenus at the same depth first.
    const deeper = open[open.indexOf(data.level) + 1];
    if (deeper && deeper !== data.sub) closeFrom(deeper);
    if (!isOpen(data.sub)) {
      open.push(data.sub);
      showLevel(data.sub);
    }
    if (focusFirst) focusItem(data.sub, 0);
  }

  function activate(itemEl: HTMLElement): void {
    const data = info.get(itemEl);
    if (!data || data.item.disabled) return;
    if (data.sub) {
      openSub(itemEl, true);
      return;
    }
    let checked: boolean | undefined;
    if (data.item.checked !== undefined) {
      checked = itemEl.getAttribute('aria-checked') !== 'true';
      itemEl.setAttribute('aria-checked', String(checked));
    }
    closeAll(true);
    options.onSelect?.(data.item.value, checked);
  }

  function typeahead(level: Level, key: string, from: number): void {
    const now = Date.now();
    typed = now - typedAt > 700 ? key.toLowerCase() : typed + key.toLowerCase();
    typedAt = now;
    const n = level.items.length;
    // A fresh letter searches after the focused item; a growing prefix includes it.
    const start = typed.length > 1 ? from : from + 1;
    for (let k = 0; k < n; k++) {
      const idx = (start + k + n) % n;
      if (info.get(level.items[idx]!)!.item.label.toLowerCase().startsWith(typed)) {
        focusItem(level, idx);
        return;
      }
    }
  }

  const onTriggerKey = (e: KeyboardEvent, i: number): void => {
    const n = triggers.length;
    const wasOpen = open.length > 0;
    let to: number;
    switch (e.key) {
      case 'ArrowRight':
        to = (i + 1) % n;
        break;
      case 'ArrowLeft':
        to = (i - 1 + n) % n;
        break;
      case 'Home':
        to = 0;
        break;
      case 'End':
        to = n - 1;
        break;
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        e.preventDefault();
        openTop(i, 'first');
        return;
      case 'ArrowUp':
        e.preventDefault();
        openTop(i, 'last');
        return;
      case 'Escape':
        if (wasOpen) {
          e.preventDefault();
          closeAll(true);
        }
        return;
      default:
        return;
    }
    e.preventDefault();
    setTabStop(to);
    triggers[to]!.focus();
    if (wasOpen) openTop(to, 'none');
  };

  const onItemKey = (e: KeyboardEvent, itemEl: HTMLElement): void => {
    const data = info.get(itemEl)!;
    const level = data.level;
    const from = level.items.indexOf(itemEl);
    const move = menuBarMoveTarget(level.items.length, from, e.key);
    if (move !== null) {
      e.preventDefault();
      if (open[open.length - 1] !== level) closeFrom(open[open.indexOf(level) + 1]!);
      focusItem(level, move);
      return;
    }
    const n = triggers.length;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (data.sub && !data.item.disabled) openSub(itemEl, true);
        else openTop((level.top + 1) % n, 'first');
        return;
      case 'ArrowLeft':
        e.preventDefault();
        if (level.parent) {
          closeFrom(level);
          level.opener.focus();
        } else {
          openTop((level.top - 1 + n) % n, 'first');
        }
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activate(itemEl);
        return;
      case 'Escape':
        e.preventDefault();
        closeFrom(level);
        level.opener.focus();
        return;
      case 'Tab':
        closeAll();
        return;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          typeahead(level, e.key, from);
        }
    }
  };

  el.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const ti = triggers.indexOf(target as HTMLButtonElement);
    if (ti >= 0) onTriggerKey(e, ti);
    else if (info.has(target)) onItemKey(e, target);
  }, { signal });

  el.addEventListener('click', (e) => {
    const target = e.target as Element;
    const trigger = target.closest<HTMLButtonElement>('.mh-menu-bar__trigger');
    if (trigger) {
      const i = triggers.indexOf(trigger);
      if (isOpen(tops[i]!)) closeAll(true);
      else openTop(i, e.detail === 0 ? 'first' : 'none');
      if (!isOpen(tops[i]!)) trigger.focus();
      return;
    }
    const itemEl = target.closest<HTMLElement>('.mh-menu-bar__item');
    if (itemEl && info.has(itemEl)) activate(itemEl);
  }, { signal });

  el.addEventListener('pointerover', (e) => {
    if (open.length === 0) return;
    const target = e.target as Element;
    const trigger = target.closest<HTMLButtonElement>('.mh-menu-bar__trigger');
    if (trigger) {
      const i = triggers.indexOf(trigger);
      if (!isOpen(tops[i]!) && !options.menus[i]!.disabled) {
        openTop(i, 'none');
        trigger.focus();
      }
      return;
    }
    const itemEl = target.closest<HTMLElement>('.mh-menu-bar__item');
    const data = itemEl ? info.get(itemEl) : undefined;
    if (!itemEl || !data || !isOpen(data.level)) return;
    if (document.activeElement !== itemEl) itemEl.focus();
    if (data.sub) openSub(itemEl, false);
    else {
      const deeper = open[open.indexOf(data.level) + 1];
      if (deeper) closeFrom(deeper);
    }
  }, { signal });

  el.addEventListener('focusin', (e) => {
    const ti = triggers.indexOf(e.target as HTMLButtonElement);
    if (ti >= 0) setTabStop(ti);
  }, { signal });

  el.addEventListener('focusout', (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !el.contains(next)) closeAll();
  }, { signal });

  const onDocPointer = (e: PointerEvent): void => {
    if (open.length > 0 && !el.contains(e.target as Node)) closeAll();
  };
  document.addEventListener('pointerdown', onDocPointer, { signal });

  setTabStop(tabStop);
  return {
    el,
    close: () => closeAll(),
    setChecked(value, checked) {
      const itemEl = byValue.get(value);
      if (itemEl?.hasAttribute('aria-checked')) itemEl.setAttribute('aria-checked', String(checked));
    },
    setDisabled(value, disabled) {
      const itemEl = byValue.get(value);
      const data = itemEl ? info.get(itemEl) : undefined;
      if (!itemEl || !data) return;
      data.item = { ...data.item, disabled };
      if (disabled) itemEl.setAttribute('aria-disabled', 'true');
      else itemEl.removeAttribute('aria-disabled');
    },
    destroy() {
      closeAll();
      listeners.abort();
      if (root) root.replaceChildren();
    },
  };
}
