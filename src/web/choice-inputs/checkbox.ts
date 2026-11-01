import { mdiCheck, mdiMinus } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon } from '../icons.ts';

/** The label and description beside a checkbox, radio or switch. Sets `aria-describedby` on the input. */
export function choiceText(block: string, input: HTMLInputElement, label?: string, description?: string): HTMLSpanElement | null {
  if (!label) return null;
  const text = h('span', { class: `${block}__text` }, h('span', { class: `${block}__label` }, label));
  if (description) {
    const id = uid('mh-desc');
    text.append(h('span', { class: `${block}__description`, id }, description));
    input.setAttribute('aria-describedby', id);
  }
  return text;
}

export interface CheckboxOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  /** A second line under the label (announced as the description). */
  description?: string;
  checked?: boolean;
  /** Mixed state, e.g. a "select all" over a partly selected list. Cleared when the user toggles it. */
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: (checked: boolean, event: Event) => void;
}

export interface CheckboxHandle {
  el: HTMLLabelElement;
  input: HTMLInputElement;
  isChecked(): boolean;
  setChecked(checked: boolean): void;
  setIndeterminate(indeterminate: boolean): void;
  setDisabled(disabled: boolean): void;
}

/** CSS class of the checkbox root. */
export function checkboxClass(className?: string): string {
  return cx('mh-checkbox', className);
}

/**
 * `.mh-checkbox`: a native checkbox (drawn by CSS, so the platform keeps its keyboard and screen-reader
 * behaviour) with a label and optional description. `indeterminate` shows a dash and reads as "mixed".
 */
export function createCheckbox(options: CheckboxOptions): CheckboxHandle {
  const input = h('input', { type: 'checkbox', class: 'mh-checkbox__input', name: options.name, value: options.value, 'aria-label': options.label ? undefined : options.ariaLabel });
  input.checked = options.checked ?? false;
  input.indeterminate = options.indeterminate ?? false;
  input.disabled = options.disabled ?? false;
  const el = h(
    'label',
    { class: checkboxClass() },
    h('span', { class: 'mh-checkbox__control' }, input, createIcon(mdiCheck, { class: 'mh-checkbox__check' }), createIcon(mdiMinus, { class: 'mh-checkbox__dash' })),
    choiceText('mh-checkbox', input, options.label, options.description),
  );
  if (options.onChange) input.addEventListener('change', (event) => options.onChange!(input.checked, event));
  return {
    el,
    input,
    isChecked: () => input.checked,
    setChecked(checked) {
      input.checked = checked;
    },
    setIndeterminate(value) {
      input.indeterminate = value;
    },
    setDisabled(disabled) {
      input.disabled = disabled;
    },
  };
}
