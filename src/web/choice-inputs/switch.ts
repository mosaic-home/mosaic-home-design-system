import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { choiceText } from './checkbox.ts';

export interface SwitchOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  /** A second line under the label (announced as the description). */
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  /** The settings toggle row: label (and icon) at the start, the switch at the end, full width. */
  row?: boolean;
  /** A leading icon in the row. */
  icon?: IconName | string;
  name?: string;
  onChange?: (checked: boolean, event: Event) => void;
}

export interface SwitchHandle {
  el: HTMLLabelElement;
  input: HTMLInputElement;
  isChecked(): boolean;
  setChecked(checked: boolean): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for a switch root. */
export function switchClass(row = false): string {
  return cx('mh-switch', row && 'mh-switch--row');
}

/**
 * `.mh-switch` (`--row` for the settings toggle row): a native `<input type="checkbox" role="switch">`, so Space
 * toggles it and screen readers announce on/off. The track takes the control radius, so square corners give a
 * square switch.
 */
export function createSwitch(options: SwitchOptions): SwitchHandle {
  const input = h('input', { type: 'checkbox', role: 'switch', class: 'mh-switch__input', name: options.name, 'aria-label': options.label ? undefined : options.ariaLabel });
  input.checked = options.checked ?? false;
  input.disabled = options.disabled ?? false;
  const el = h(
    'label',
    { class: switchClass(options.row) },
    options.icon ? h('span', { class: 'mh-switch__icon' }, createIcon(options.icon)) : null,
    choiceText('mh-switch', input, options.label, options.description),
    h('span', { class: 'mh-switch__control' }, input, h('span', { class: 'mh-switch__thumb', 'aria-hidden': 'true' })),
  );
  if (options.onChange) input.addEventListener('change', (event) => options.onChange!(input.checked, event));
  return {
    el,
    input,
    isChecked: () => input.checked,
    setChecked(checked) {
      input.checked = checked;
    },
    setDisabled(disabled) {
      input.disabled = disabled;
    },
  };
}
