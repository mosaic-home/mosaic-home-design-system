import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'tonal' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonOptions {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName | string;
  trailingIcon?: IconName | string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent) => void;
}

export interface ButtonHandle {
  el: HTMLButtonElement;
  setLabel(label: string): void;
  setLoading(loading: boolean): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for a button, for markup-first pages and the React bindings. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'medium', fullWidth = false): string {
  return cx('mh-button', `mh-button--${variant}`, size !== 'medium' && `mh-button--${size === 'small' ? 'sm' : 'lg'}`, fullWidth && 'mh-button--block');
}

/**
 * `.mh-button` with `--primary | --secondary | --tonal | --text | --danger` and `--sm | --lg`; states `.is-loading`
 * and `:disabled`. Height follows the theme's density, corners its control radius.
 */
export function createButton(options: ButtonOptions): ButtonHandle {
  const label = h('span', { class: 'mh-button__label' }, options.label);
  const el = h(
    'button',
    { type: options.type ?? 'button', class: buttonClass(options.variant, options.size, options.fullWidth) },
    options.icon ? createIcon(options.icon) : null,
    label,
    options.trailingIcon ? createIcon(options.trailingIcon) : null,
  );
  if (options.onClick) el.addEventListener('click', options.onClick);
  let disabled = false;
  let loading = false;
  const sync = (): void => {
    el.disabled = disabled || loading;
    el.classList.toggle('is-loading', loading);
    el.toggleAttribute('aria-busy', loading);
  };
  const handle: ButtonHandle = {
    el,
    setLabel(text) {
      label.textContent = text;
    },
    setLoading(value) {
      loading = value;
      sync();
    },
    setDisabled(value) {
      disabled = value;
      sync();
    },
  };
  disabled = options.disabled ?? false;
  loading = options.loading ?? false;
  sync();
  return handle;
}
