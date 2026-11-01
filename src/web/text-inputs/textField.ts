import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';

export type InputSize = 'small' | 'medium' | 'large';

/** CSS classes for the input box (`.mh-input`) that holds a native input, textarea or select. */
export function inputClass(size: InputSize = 'medium', extra?: string): string {
  return cx('mh-input', size !== 'medium' && `mh-input--${size === 'small' ? 'sm' : 'lg'}`, extra);
}

/** Focuses the native control when the padding or an adornment of the box is clicked. */
export function focusOnBoxClick(box: HTMLElement, control: HTMLElement): void {
  box.addEventListener('mousedown', (event) => {
    if (event.target !== control && !(event.target as Element).closest('button')) {
      event.preventDefault();
      control.focus();
    }
  });
}

export type TextFieldType = 'text' | 'email' | 'url' | 'tel' | 'password' | 'number';

export interface TextFieldOptions {
  /** Visible label. Without one, pass `ariaLabel`; the field then renders the box alone. */
  label?: string;
  ariaLabel?: string;
  value?: string;
  placeholder?: string;
  type?: TextFieldType;
  name?: string;
  helper?: string;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  /** A leading icon (decorative). */
  icon?: IconName | string;
  /** Text before the value, e.g. a currency sign. */
  prefix?: string;
  /** Text after the value, e.g. a unit. */
  suffix?: string;
  maxLength?: number;
  /** Shows a character counter (with `maxLength`, `n / max`). */
  showCount?: boolean;
  autocomplete?: string;
  inputMode?: string;
  onInput?: (value: string, event: Event) => void;
  onChange?: (value: string, event: Event) => void;
}

export interface TextFieldHandle {
  /** The field (or the bare box without a label). */
  el: HTMLElement;
  input: HTMLInputElement;
  field: FieldHandle | null;
  getValue(): string;
  setValue(value: string): void;
  setError(text: string | undefined): void;
  setHelper(text: string | undefined): void;
  setSuccess(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** The leading and trailing parts of an input box, shared with the React binding's markup. */
export function inputAdornment(content: Node | string, end = false): HTMLSpanElement {
  return h('span', { class: cx('mh-input__adornment', end && 'mh-input__adornment--end') }, content);
}

/**
 * `.mh-input` (`--sm | --lg`) inside a `.mh-field`: a single-line text input with an optional icon, prefix, suffix
 * and counter. States: `:focus-within`, `[aria-invalid]`, `:disabled`. Height follows `--mh-control-*`.
 */
export function createTextField(options: TextFieldOptions): TextFieldHandle {
  const input = h('input', {
    class: 'mh-input__control',
    type: options.type ?? 'text',
    name: options.name,
    placeholder: options.placeholder,
    maxlength: options.maxLength,
    autocomplete: options.autocomplete,
    inputmode: options.inputMode,
    readonly: options.readOnly,
    'aria-label': options.label ? undefined : options.ariaLabel,
  });
  input.value = options.value ?? '';
  const box = h(
    'div',
    { class: inputClass(options.size) },
    options.icon ? inputAdornment(createIcon(options.icon)) : null,
    options.prefix ? inputAdornment(options.prefix) : null,
    input,
    options.suffix ? inputAdornment(options.suffix, true) : null,
  );
  focusOnBoxClick(box, input);

  const field = options.label
    ? createField({
        label: options.label,
        control: box,
        target: input,
        helper: options.helper,
        error: options.error,
        success: options.success,
        required: options.required,
        labelStyle: options.labelStyle,
        counter: options.showCount,
      })
    : null;
  const updateCount = (): void => field?.setCount(input.value.length, options.maxLength);
  updateCount();
  input.addEventListener('input', (event) => {
    updateCount();
    options.onInput?.(input.value, event);
  });
  if (options.onChange) input.addEventListener('change', (event) => options.onChange!(input.value, event));

  const handle: TextFieldHandle = {
    el: field?.el ?? box,
    input,
    field,
    getValue: () => input.value,
    setValue(value) {
      input.value = value;
      updateCount();
    },
    setError: (text) => field?.setError(text),
    setHelper: (text) => field?.setHelper(text),
    setSuccess: (text) => field?.setSuccess(text),
    setDisabled(disabled) {
      input.disabled = disabled;
      box.classList.toggle('is-disabled', disabled);
      field?.setDisabled(disabled);
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
