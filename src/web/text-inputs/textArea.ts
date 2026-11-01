import { h } from '../dom.ts';
import { createField, type FieldHandle } from './field.ts';
import { focusOnBoxClick, inputClass } from './textField.ts';

export interface TextAreaOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  value?: string;
  placeholder?: string;
  name?: string;
  helper?: string;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  labelStyle?: 'label' | 'eyebrow';
  /** Starting height in rows (default 3). */
  rows?: number;
  /** Grows with its text up to this many rows, then scrolls (default 10). */
  maxRows?: number;
  /** Grow with the text (default true). */
  autoGrow?: boolean;
  maxLength?: number;
  /** Shows a character counter (with `maxLength`, `n / max`). */
  showCount?: boolean;
  onInput?: (value: string, event: Event) => void;
  onChange?: (value: string, event: Event) => void;
}

export interface TextAreaHandle {
  el: HTMLElement;
  textarea: HTMLTextAreaElement;
  field: FieldHandle | null;
  getValue(): string;
  setValue(value: string): void;
  setError(text: string | undefined): void;
  setHelper(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
  /** Re-measures the height (call after the element is shown, if it was hidden when the value was set). */
  resize(): void;
}

/**
 * Sets a textarea's height to fit its text, from its `rows` up to `maxRows`, then scrolls. The box carries the
 * padding and border, so the textarea's height is its content. Exported for the React binding.
 */
export function autoSize(textarea: HTMLTextAreaElement, maxRows = 10): void {
  const style = getComputedStyle(textarea);
  const line = parseFloat(style.lineHeight) || (parseFloat(style.fontSize) || 16) * 1.45;
  const max = Math.ceil(line * maxRows);
  textarea.style.height = 'auto';
  const content = textarea.scrollHeight;
  if (content > 0) textarea.style.height = `${Math.min(content, max)}px`;
  textarea.style.overflowY = content > max ? 'auto' : 'hidden';
}

/**
 * `.mh-input.mh-input--multiline` inside a `.mh-field`: a textarea that grows with its text (`autoGrow`, up to
 * `maxRows`) and an optional character counter.
 */
export function createTextArea(options: TextAreaOptions): TextAreaHandle {
  const textarea = h('textarea', {
    class: 'mh-input__control',
    name: options.name,
    rows: options.rows ?? 3,
    placeholder: options.placeholder,
    maxlength: options.maxLength,
    readonly: options.readOnly,
    'aria-label': options.label ? undefined : options.ariaLabel,
  });
  textarea.value = options.value ?? '';
  const box = h('div', { class: inputClass('medium', 'mh-input--multiline') }, textarea);
  focusOnBoxClick(box, textarea);
  const field = options.label
    ? createField({
        label: options.label,
        control: box,
        target: textarea,
        helper: options.helper,
        error: options.error,
        success: options.success,
        required: options.required,
        labelStyle: options.labelStyle,
        counter: options.showCount,
      })
    : null;

  const grow = options.autoGrow ?? true;
  const update = (): void => {
    field?.setCount(textarea.value.length, options.maxLength);
    if (grow && textarea.isConnected) autoSize(textarea, options.maxRows);
  };
  update();
  textarea.addEventListener('input', (event) => {
    update();
    options.onInput?.(textarea.value, event);
  });
  if (options.onChange) textarea.addEventListener('change', (event) => options.onChange!(textarea.value, event));
  // Measure once it is in the document (the first height needs layout).
  if (grow && typeof requestAnimationFrame === 'function') requestAnimationFrame(update);

  const handle: TextAreaHandle = {
    el: field?.el ?? box,
    textarea,
    field,
    getValue: () => textarea.value,
    setValue(value) {
      textarea.value = value;
      update();
    },
    setError: (text) => field?.setError(text),
    setHelper: (text) => field?.setHelper(text),
    setDisabled(disabled) {
      textarea.disabled = disabled;
      box.classList.toggle('is-disabled', disabled);
      field?.setDisabled(disabled);
    },
    resize: update,
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
