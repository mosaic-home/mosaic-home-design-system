import { cx, h, uid } from '../dom.ts';

export type FieldStatus = 'default' | 'error' | 'success';

export interface FieldOptions {
  /** The visible label. */
  label: string;
  /** The control: an input, select or textarea, or any element containing one (e.g. `.mh-input`). */
  control: HTMLElement;
  /**
   * The element the label and messages describe. Default: `control` when it is an input, select or textarea, else
   * the first one inside it, else `control` itself (labelled through `aria-labelledby`).
   */
  target?: HTMLElement;
  /** A hint under the control. */
  helper?: string;
  /** An error message; marks the control `aria-invalid`. Wins over `success`. */
  error?: string;
  /** A confirmation message under the control. */
  success?: string;
  /** Shows a required marker and sets `required` / `aria-required`. */
  required?: boolean;
  /** Label style: a regular label (default) or a small mono, uppercase eyebrow. */
  labelStyle?: 'label' | 'eyebrow';
  /** Reserves a character counter at the end of the footer (see `setCount`). */
  counter?: boolean;
}

export interface FieldHandle {
  el: HTMLDivElement;
  label: HTMLLabelElement | HTMLSpanElement;
  /** The described element (input, select, textarea or the control). */
  target: HTMLElement;
  setHelper(text: string | undefined): void;
  setError(text: string | undefined): void;
  setSuccess(text: string | undefined): void;
  /** Updates the counter: `3 / 40` with a max, `3` without. */
  setCount(count: number, max?: number): void;
  /** Dims the label and messages (the control disables itself). */
  setDisabled(disabled: boolean): void;
}

/** CSS classes for a field root. */
export function fieldClass(status: FieldStatus = 'default', labelStyle: 'label' | 'eyebrow' = 'label', disabled = false): string {
  return cx('mh-field', labelStyle === 'eyebrow' && 'mh-field--eyebrow', status === 'error' && 'is-invalid', status === 'success' && 'is-valid', disabled && 'is-disabled');
}

/** The status a field shows for these messages. */
export function fieldStatus(error?: string, success?: string): FieldStatus {
  return error ? 'error' : success ? 'success' : 'default';
}

/** The text of the counter. */
export function fieldCountText(count: number, max?: number): string {
  return max === undefined ? String(count) : `${count} / ${max}`;
}

const LABELABLE = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

/**
 * `.mh-field`: a label above, a message below (helper, error or success) and an optional counter, around any
 * control. Wires `for`/`id` (or `aria-labelledby`), `aria-describedby`, `aria-invalid` and `aria-required`. The
 * message is a polite live region, so errors set later are announced.
 */
export function createField(options: FieldOptions): FieldHandle {
  const target = options.target ?? (LABELABLE.has(options.control.tagName) ? options.control : options.control.querySelector<HTMLElement>('input, select, textarea')) ?? options.control;
  const labelable = LABELABLE.has(target.tagName);
  if (!target.id) target.id = uid('mh-control');
  const labelId = uid('mh-label');
  const messageId = uid('mh-message');

  const label = labelable
    ? h('label', { class: 'mh-field__label', id: labelId, for: target.id }, options.label)
    : h('span', { class: 'mh-field__label', id: labelId }, options.label);
  if (options.required) label.append(h('span', { class: 'mh-field__required', 'aria-hidden': 'true' }, '*'));
  if (!labelable) target.setAttribute('aria-labelledby', labelId);

  const message = h('p', { class: 'mh-field__message', id: messageId, 'aria-live': 'polite' });
  const count = options.counter ? h('span', { class: 'mh-field__count' }) : null;
  const el = h('div', { class: fieldClass('default', options.labelStyle) }, label, options.control, h('div', { class: 'mh-field__footer' }, message, count));

  if (options.required) {
    if (labelable) (target as HTMLInputElement).required = true;
    else target.setAttribute('aria-required', 'true');
  }

  let helper = options.helper;
  let error = options.error;
  let success = options.success;
  let disabled = false;
  const sync = (): void => {
    const status = fieldStatus(error, success);
    const text = error || success || helper || '';
    message.textContent = text;
    message.hidden = !text;
    el.className = fieldClass(status, options.labelStyle, disabled);
    if (text) target.setAttribute('aria-describedby', messageId);
    else target.removeAttribute('aria-describedby');
    if (status === 'error') target.setAttribute('aria-invalid', 'true');
    else target.removeAttribute('aria-invalid');
  };
  sync();

  return {
    el,
    label,
    target,
    setHelper(text) {
      helper = text;
      sync();
    },
    setError(text) {
      error = text;
      sync();
    },
    setSuccess(text) {
      success = text;
      sync();
    },
    setCount(n, max) {
      if (count) count.textContent = fieldCountText(n, max);
    },
    setDisabled(value) {
      disabled = value;
      sync();
    },
  };
}
