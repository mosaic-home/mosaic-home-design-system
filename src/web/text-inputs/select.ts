import { mdiChevronDown } from '@mdi/js';
import { h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';
import { inputClass, type InputSize } from './textField.ts';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: readonly SelectOption[];
}

export type SelectItem = SelectOption | SelectOptionGroup;

export interface SelectOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  /** Options, or groups of options (`<optgroup>`). */
  options: readonly SelectItem[];
  value?: string;
  /** A first, empty choice shown until one is picked. */
  placeholder?: string;
  name?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  onChange?: (value: string, event: Event) => void;
}

export interface SelectHandle {
  el: HTMLElement;
  select: HTMLSelectElement;
  field: FieldHandle | null;
  getValue(): string;
  setValue(value: string): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

export const isOptionGroup = (item: SelectItem): item is SelectOptionGroup => 'options' in item;

/** CSS classes for the select box. */
export function selectClass(size: InputSize = 'medium'): string {
  return inputClass(size, 'mh-select');
}

const option = (o: SelectOption): HTMLOptionElement => h('option', { value: o.value, disabled: o.disabled }, o.label);

/**
 * `.mh-input.mh-select`: a styled native `<select>` with a chevron, inside a `.mh-field`. The platform draws the
 * list, so it works with every keyboard, screen reader and touch picker.
 */
export function createSelect(options: SelectOptions): SelectHandle {
  const select = h(
    'select',
    { class: 'mh-input__control', name: options.name, 'aria-label': options.label ? undefined : options.ariaLabel },
    options.placeholder !== undefined ? h('option', { value: '', disabled: true }, options.placeholder) : null,
    ...options.options.map((item) => (isOptionGroup(item) ? h('optgroup', { label: item.label }, ...item.options.map(option)) : option(item))),
  );
  select.value = options.value ?? (options.placeholder !== undefined ? '' : select.value);
  const box = h('div', { class: selectClass(options.size) }, select, h('span', { class: 'mh-select__chevron' }, createIcon(mdiChevronDown)));
  const field = options.label
    ? createField({ label: options.label, control: box, target: select, helper: options.helper, error: options.error, required: options.required, labelStyle: options.labelStyle })
    : null;
  if (options.onChange) select.addEventListener('change', (event) => options.onChange!(select.value, event));

  const handle: SelectHandle = {
    el: field?.el ?? box,
    select,
    field,
    getValue: () => select.value,
    setValue(value) {
      select.value = value;
    },
    setError: (text) => field?.setError(text),
    setDisabled(disabled) {
      select.disabled = disabled;
      box.classList.toggle('is-disabled', disabled);
      field?.setDisabled(disabled);
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
