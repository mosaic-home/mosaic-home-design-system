import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type IconButtonTone = 'default' | 'accent' | 'danger';
export type IconButtonSize = 'small' | 'medium' | 'large';

export interface IconButtonOptions {
  icon: IconName | string;
  /** Required: the button's accessible name (also its tooltip). */
  label: string;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  /** A filled circle (raised surface) rather than a bare glyph. */
  filled?: boolean;
  /** Toggle buttons: sets `aria-pressed`. */
  pressed?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export interface IconButtonHandle {
  el: HTMLButtonElement;
  setIcon(icon: IconName | string): void;
  setPressed(pressed: boolean): void;
  setDisabled(disabled: boolean): void;
}

export function iconButtonClass(tone: IconButtonTone = 'default', size: IconButtonSize = 'medium', filled = false): string {
  return cx('mh-icon-button', tone !== 'default' && `mh-icon-button--${tone}`, size !== 'medium' && `mh-icon-button--${size === 'small' ? 'sm' : 'lg'}`, filled && 'mh-icon-button--filled');
}

/** `.mh-icon-button`: a round, icon-only button at least a touch target wide. */
export function createIconButton(options: IconButtonOptions): IconButtonHandle {
  const el = h('button', { type: 'button', class: iconButtonClass(options.tone, options.size, options.filled), 'aria-label': options.label, title: options.label }, createIcon(options.icon));
  if (options.onClick) el.addEventListener('click', options.onClick);
  const handle: IconButtonHandle = {
    el,
    setIcon(icon) {
      el.replaceChildren(createIcon(icon));
    },
    setPressed(pressed) {
      el.setAttribute('aria-pressed', String(pressed));
    },
    setDisabled(disabled) {
      el.disabled = disabled;
    },
  };
  if (options.pressed !== undefined) handle.setPressed(options.pressed);
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
