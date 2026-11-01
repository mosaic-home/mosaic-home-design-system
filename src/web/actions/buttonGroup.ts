import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { buttonClass, type ButtonSize } from './button.ts';

export type ButtonGroupVariant = 'secondary' | 'tonal';
export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupItem {
  id: string;
  /** Visible text, or the accessible name (and tooltip) of an icon-only button. */
  label: string;
  icon?: IconName | string;
  /** Show only the icon. */
  iconOnly?: boolean;
  /** Toggle buttons: sets `aria-pressed`. Leave undefined for plain action buttons. */
  pressed?: boolean;
  disabled?: boolean;
}

export interface ButtonGroupOptions {
  items: readonly ButtonGroupItem[];
  /** Accessible name of the group, e.g. "Text style" or "Playback". */
  label?: string;
  variant?: ButtonGroupVariant;
  size?: ButtonSize;
  orientation?: ButtonGroupOrientation;
  /** A toolbar: one tab stop, arrow keys (and Home / End) move between the buttons. */
  toolbar?: boolean;
  /** Stretch across the container, buttons sharing the width. */
  fullWidth?: boolean;
  onClick?: (id: string, event: MouseEvent) => void;
}

export interface ButtonGroupHandle {
  el: HTMLDivElement;
  setPressed(id: string, pressed: boolean | undefined): void;
  setDisabled(id: string, disabled: boolean): void;
}

export function buttonGroupClass(variant: ButtonGroupVariant = 'secondary', orientation: ButtonGroupOrientation = 'horizontal', fullWidth = false): string {
  return cx('mh-button-group', variant === 'tonal' && 'mh-button-group--tonal', orientation === 'vertical' && 'mh-button-group--vertical', fullWidth && 'mh-button-group--block');
}

export function buttonGroupItemClass(variant: ButtonGroupVariant = 'secondary', size: ButtonSize = 'medium', iconOnly = false): string {
  return cx(buttonClass(variant, size), 'mh-button-group__item', iconOnly && 'mh-button-group__item--icon');
}

/** The ARIA role and orientation of the group element. */
export function buttonGroupAria(toolbar = false, orientation: ButtonGroupOrientation = 'horizontal'): { role: 'group' | 'toolbar'; 'aria-orientation'?: 'vertical' } {
  return toolbar ? { role: 'toolbar', ...(orientation === 'vertical' ? { 'aria-orientation': 'vertical' as const } : {}) } : { role: 'group' };
}

/** A toolbar's tab stop: the wanted button when it is enabled, else the first enabled one (-1 when none). */
export function buttonGroupTabStop(items: readonly Pick<ButtonGroupItem, 'disabled'>[], wanted = 0): number {
  if (items[wanted] && !items[wanted].disabled) return wanted;
  return items.findIndex((i) => !i.disabled);
}

/** Where a toolbar key moves focus from button `from` (skipping disabled ones, wrapping); `null` for other keys. */
export function buttonGroupKeyTarget(items: readonly Pick<ButtonGroupItem, 'disabled'>[], from: number, key: string, orientation: ButtonGroupOrientation = 'horizontal'): number | null {
  const enabled = items.map((_, i) => i).filter((i) => !items[i]!.disabled);
  if (!enabled.length) return null;
  const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
  if (key === 'Home') return enabled[0]!;
  if (key === 'End') return enabled[enabled.length - 1]!;
  if (key !== next && key !== prev) return null;
  const step = key === next ? 1 : -1;
  for (let n = 1; n <= items.length; n++) {
    const i = (((from + step * n) % items.length) + items.length) % items.length;
    if (!items[i]!.disabled) return i;
  }
  return null;
}

/**
 * `.mh-button-group` (`--tonal`, `--vertical`, `--block`): buttons joined into one segment, each a `.mh-button` with
 * `.mh-button-group__item` (`--icon` when icon-only). `role="group"`, or `role="toolbar"` with a roving tab stop.
 * Toggle items carry `aria-pressed`.
 */
export function createButtonGroup(options: ButtonGroupOptions): ButtonGroupHandle {
  const items = options.items.map((item) => ({ ...item }));
  const orientation = options.orientation ?? 'horizontal';
  const el = h('div', { class: buttonGroupClass(options.variant, orientation, options.fullWidth), ...buttonGroupAria(options.toolbar, orientation), 'aria-label': options.label ?? null });
  const buttons = items.map((item) => {
    const btn = h(
      'button',
      {
        type: 'button',
        class: buttonGroupItemClass(options.variant, options.size, item.iconOnly),
        'aria-label': item.iconOnly ? item.label : null,
        title: item.iconOnly ? item.label : null,
        'aria-pressed': item.pressed === undefined ? null : String(item.pressed),
        disabled: item.disabled ?? false,
      },
      item.icon ? createIcon(item.icon) : null,
      item.iconOnly ? null : h('span', { class: 'mh-button__label' }, item.label),
    );
    btn.addEventListener('click', (e) => options.onClick?.(item.id, e));
    el.append(btn);
    return btn;
  });

  let stop = buttonGroupTabStop(items);
  const syncStops = (): void => {
    if (!options.toolbar) return;
    stop = buttonGroupTabStop(items, stop);
    buttons.forEach((b, i) => (b.tabIndex = i === stop ? 0 : -1));
  };
  syncStops();
  if (options.toolbar) {
    el.addEventListener('keydown', (e) => {
      const from = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (from < 0) return;
      const to = buttonGroupKeyTarget(items, from, e.key, orientation);
      if (to === null) return;
      e.preventDefault();
      stop = to;
      syncStops();
      buttons[to]!.focus();
    });
    el.addEventListener('focusin', (e) => {
      const at = buttons.indexOf(e.target as HTMLButtonElement);
      if (at >= 0 && at !== stop) {
        stop = at;
        syncStops();
      }
    });
  }

  const find = (id: string): number => items.findIndex((i) => i.id === id);
  return {
    el,
    setPressed(id, pressed) {
      const i = find(id);
      if (i < 0) return;
      items[i]!.pressed = pressed;
      if (pressed === undefined) buttons[i]!.removeAttribute('aria-pressed');
      else buttons[i]!.setAttribute('aria-pressed', String(pressed));
    },
    setDisabled(id, disabled) {
      const i = find(id);
      if (i < 0) return;
      items[i]!.disabled = disabled;
      buttons[i]!.disabled = disabled;
      syncStops();
    },
  };
}
