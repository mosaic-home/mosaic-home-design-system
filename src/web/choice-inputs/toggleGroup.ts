import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: IconName | string;
  /** Show only the icon; `label` becomes the accessible name and the hint. */
  iconOnly?: boolean;
  disabled?: boolean;
}

export type ToggleGroupType = 'single' | 'multiple';

export interface ToggleGroupOptions {
  /** Accessible name of the group. */
  label: string;
  options: readonly ToggleOption[];
  /** `single`: at most one pressed (pressing another moves it). `multiple`: any number. Default `multiple`. */
  type?: ToggleGroupType;
  /** The pressed values. */
  values?: readonly string[];
  /** `single` only: one stays pressed (pressing it again does nothing). */
  required?: boolean;
  size?: 'small' | 'medium';
  /** Stretch to the container, toggles sharing the width. */
  fullWidth?: boolean;
  disabled?: boolean;
  onChange?: (values: string[], event: Event) => void;
}

export interface ToggleGroupHandle {
  el: HTMLDivElement;
  buttons: HTMLButtonElement[];
  getValues(): string[];
  setValues(values: readonly string[]): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for a toggle group root. */
export function toggleGroupClass(size: 'small' | 'medium' = 'medium', fullWidth = false): string {
  return cx('mh-toggle-group', size === 'small' && 'mh-toggle-group--sm', fullWidth && 'mh-toggle-group--block');
}

/** The values after pressing `value`, for either type. */
export function toggleGroupNext(current: readonly string[], value: string, type: ToggleGroupType = 'multiple', required = false): string[] {
  const on = current.includes(value);
  if (type === 'single') {
    if (on) return required ? [...current] : [];
    return [value];
  }
  return on ? current.filter((v) => v !== value) : [...current, value];
}

/**
 * Which toggle takes Tab (the roving focus): the first pressed enabled one, else the first enabled one.
 * Returns -1 when every toggle is disabled.
 */
export function toggleGroupTabStop(options: readonly ToggleOption[], values: readonly string[], disabled = false): number {
  if (disabled) return -1;
  const pressed = options.findIndex((o) => !o.disabled && values.includes(o.value));
  return pressed >= 0 ? pressed : options.findIndex((o) => !o.disabled);
}

/**
 * The index the focus moves to for a key (Arrow keys, Home, End), skipping disabled toggles and wrapping; null for
 * other keys.
 */
export function toggleGroupKey(key: string, index: number, options: readonly ToggleOption[]): number | null {
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  if (enabled.length === 0) return null;
  const at = enabled.indexOf(index);
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return enabled[(at + 1) % enabled.length]!;
    case 'ArrowLeft':
    case 'ArrowUp':
      return enabled[(at - 1 + enabled.length) % enabled.length]!;
    case 'Home':
      return enabled[0]!;
    case 'End':
      return enabled[enabled.length - 1]!;
    default:
      return null;
  }
}

/**
 * `.mh-toggle-group` (`role="group"`): a row of `.mh-toggle-group__item` toggle buttons (`aria-pressed`) with text,
 * an icon or both, for formatting-style choices such as which days or which zones. One Tab stop: arrow keys, Home
 * and End move between toggles, Space or Enter presses. `single` keeps at most one pressed (and with `required`,
 * exactly one); `multiple` any number.
 */
export function createToggleGroup(options: ToggleGroupOptions): ToggleGroupHandle {
  const type = options.type ?? 'multiple';
  let values = [...(options.values ?? [])];
  if (type === 'single') values = values.slice(0, 1);
  let disabled = options.disabled ?? false;
  const buttons = options.options.map((o) =>
    h(
      'button',
      { type: 'button', class: 'mh-toggle-group__item', 'aria-label': o.iconOnly ? o.label : undefined, title: o.iconOnly ? o.label : undefined, 'data-value': o.value },
      o.icon ? createIcon(o.icon) : null,
      o.iconOnly ? null : h('span', { class: 'mh-toggle-group__label' }, o.label),
    ),
  );
  const el = h('div', { class: toggleGroupClass(options.size, options.fullWidth), role: 'group', 'aria-label': options.label }, ...buttons);

  const sync = (): void => {
    const stop = toggleGroupTabStop(options.options, values, disabled);
    buttons.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(values.includes(options.options[i]!.value)));
      b.disabled = disabled || (options.options[i]!.disabled ?? false);
      b.tabIndex = i === stop ? 0 : -1;
    });
  };

  buttons.forEach((b, i) => {
    b.addEventListener('click', (event) => {
      const next = toggleGroupNext(values, options.options[i]!.value, type, options.required);
      const changed = next.length !== values.length || next.some((v) => !values.includes(v));
      values = next;
      sync();
      // Keep the Tab stop on the toggle just used.
      for (const other of buttons) other.tabIndex = other === b ? 0 : -1;
      if (changed) options.onChange?.([...values], event);
    });
    b.addEventListener('keydown', (event) => {
      const to = toggleGroupKey(event.key, i, options.options);
      if (to === null) return;
      event.preventDefault();
      for (const other of buttons) other.tabIndex = -1;
      buttons[to]!.tabIndex = 0;
      buttons[to]!.focus();
    });
  });
  sync();

  return {
    el,
    buttons,
    getValues: () => [...values],
    setValues(next) {
      values = type === 'single' ? next.slice(0, 1) : [...next];
      sync();
    },
    setDisabled(value) {
      disabled = value;
      sync();
    },
  };
}
