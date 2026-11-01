import { mdiChevronDown } from '@mdi/js';
import { buttonClass, type ButtonSize } from '../actions/button.ts';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createMenu, type MenuEntry, type MenuHandle, type MenuPlacement } from './menu.ts';

export type SplitButtonVariant = 'primary' | 'secondary' | 'tonal';

export interface SplitButtonOptions {
  /** The main action's label. */
  label: string;
  icon?: IconName | string;
  variant?: SplitButtonVariant;
  size?: ButtonSize;
  /** The alternatives in the menu. */
  items: readonly MenuEntry[];
  /** Accessible name of the menu button. Default "More options". */
  menuLabel?: string;
  /** Default `bottom-end`; flips when there's no room. */
  placement?: MenuPlacement;
  disabled?: boolean;
  /** The main action. */
  onClick?: (event: MouseEvent) => void;
  /** An alternative was chosen from the menu. */
  onSelect?: (value: string) => void;
  /** Portals the menu into the nearest `[data-mh-theme]` ancestor of this element. */
  container?: HTMLElement | null;
}

export interface SplitButtonHandle {
  el: HTMLDivElement;
  button: HTMLButtonElement;
  toggle: HTMLButtonElement;
  menu: MenuHandle;
  setLabel(label: string): void;
  setItems(items: readonly MenuEntry[]): void;
  setDisabled(disabled: boolean): void;
  destroy(): void;
}

export const SPLIT_BUTTON_MENU_LABEL = 'More options';

/** CSS classes for a split button root. */
export function splitButtonClass(variant: SplitButtonVariant = 'primary', size: ButtonSize = 'medium'): string {
  return cx('mh-split-button', `mh-split-button--${variant}`, size !== 'medium' && `mh-split-button--${size === 'small' ? 'sm' : 'lg'}`);
}

/** CSS classes for the main button and the menu button. */
export function splitButtonPartClass(part: 'main' | 'toggle', variant: SplitButtonVariant = 'primary', size: ButtonSize = 'medium'): string {
  return cx(buttonClass(variant, size), `mh-split-button__${part}`);
}

/**
 * `.mh-split-button` (`role="group"`): a main action (`__main`) joined to a menu button (`__toggle`, a chevron) that
 * opens a `.mh-menu` of alternatives ("Run scene" with "Run in 10 minutes", "Edit scene"). Both halves are real
 * buttons in the Tab order; the menu button has the menu-button keyboard (Enter, Space, Arrow Down / Up).
 */
export function createSplitButton(options: SplitButtonOptions): SplitButtonHandle {
  const label = h('span', { class: 'mh-button__label' }, options.label);
  const button = h('button', { type: 'button', class: splitButtonPartClass('main', options.variant, options.size) }, options.icon ? createIcon(options.icon) : null, label);
  const menuLabel = options.menuLabel ?? SPLIT_BUTTON_MENU_LABEL;
  const toggle = h('button', { type: 'button', class: splitButtonPartClass('toggle', options.variant, options.size), 'aria-label': menuLabel, title: menuLabel }, createIcon(mdiChevronDown));
  const el = h('div', { class: splitButtonClass(options.variant, options.size), role: 'group', 'aria-label': options.label }, button, toggle);
  if (options.onClick) button.addEventListener('click', options.onClick);
  const menu = createMenu({ anchor: toggle, items: options.items, placement: options.placement ?? 'bottom-end', onSelect: (v) => options.onSelect?.(v), container: options.container });
  const setDisabled = (disabled: boolean): void => {
    button.disabled = disabled;
    toggle.disabled = disabled;
    if (disabled) menu.close();
  };
  if (options.disabled) setDisabled(true);
  return {
    el,
    button,
    toggle,
    menu,
    setLabel(text) {
      label.textContent = text;
      el.setAttribute('aria-label', text);
    },
    setItems: menu.setItems,
    setDisabled,
    destroy: menu.destroy,
  };
}
