import { mdiCheck, mdiContentCopy, mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';
import { focusOnBoxClick, inputAdornment, inputClass, type InputSize } from './textField.ts';

/**
 * What the secret is. `password` and `new-password` set the matching `autocomplete` so password managers fill or
 * save it; `key` is an API key or token: mono text, no autocomplete, no spelling or capitalisation fixes.
 */
export type SecretKind = 'password' | 'new-password' | 'key';

export interface SecretFieldOptions {
  /** Visible label. Without one, pass `ariaLabel`; the field then renders the box alone. */
  label?: string;
  ariaLabel?: string;
  value?: string;
  placeholder?: string;
  kind?: SecretKind;
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
  /** Starts with the text shown. */
  revealed?: boolean;
  /** Shows a copy button (default: true for `key`, false for passwords). */
  copyable?: boolean;
  /** Accessible name of the reveal toggle (default "Show password" or "Show key"). */
  revealLabel?: string;
  copyLabel?: string;
  /** Announced after copying (default "Copied"). */
  copiedText?: string;
  /** Announced when the clipboard refused (default "Couldn't copy"). */
  copyFailedText?: string;
  onInput?: (value: string, event: Event) => void;
  onChange?: (value: string, event: Event) => void;
  onReveal?: (revealed: boolean) => void;
  onCopy?: (ok: boolean) => void;
}

export interface SecretFieldHandle {
  el: HTMLElement;
  input: HTMLInputElement;
  field: FieldHandle | null;
  revealButton: HTMLButtonElement;
  copyButton: HTMLButtonElement | null;
  getValue(): string;
  setValue(value: string): void;
  isRevealed(): boolean;
  setRevealed(revealed: boolean): void;
  /** Copies the value to the clipboard; resolves to whether it worked. */
  copy(): Promise<boolean>;
  setError(text: string | undefined): void;
  setHelper(text: string | undefined): void;
  setSuccess(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for the secret box. */
export function secretFieldClass(size: InputSize = 'medium', kind: SecretKind = 'password', disabled = false): string {
  return inputClass(size, cx('mh-secret', kind === 'key' && 'mh-secret--key', disabled && 'is-disabled'));
}

/** CSS classes of a button inside an input box (reveal, copy, clear). */
export const INPUT_ACTION_CLASS = cx(iconButtonClass('default', 'small'), 'mh-input__action');

/** The input attributes for a kind of secret. */
export function secretInputAttrs(kind: SecretKind): { autocomplete: string; spellcheck: 'false'; autocapitalize: 'off' } {
  return { autocomplete: kind === 'key' ? 'off' : kind === 'new-password' ? 'new-password' : 'current-password', spellcheck: 'false', autocapitalize: 'off' };
}

/** The default accessible names. */
export function secretLabels(kind: SecretKind): { reveal: string; copy: string; copied: string; failed: string } {
  return { reveal: kind === 'key' ? 'Show key' : 'Show password', copy: 'Copy', copied: 'Copied', failed: "Couldn't copy" };
}

/** How long the copy button shows its check (ms). */
export const SECRET_COPIED_MS = 1600;

/** Writes text to the clipboard; resolves to whether it worked. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * `.mh-input.mh-secret` (`--key` for API keys and tokens, in mono) inside a `.mh-field`: a password input with a
 * reveal toggle (`aria-pressed`, eye icon) and an optional copy button that shows a check and announces the result
 * in a polite live region. The text is never logged or put anywhere but the input and the clipboard.
 */
export function createSecretField(options: SecretFieldOptions): SecretFieldHandle {
  const kind = options.kind ?? 'password';
  const labels = secretLabels(kind);
  const revealLabel = options.revealLabel ?? labels.reveal;
  const copyLabel = options.copyLabel ?? labels.copy;
  let revealed = options.revealed ?? false;
  let disabled = false;

  const input = h('input', {
    class: 'mh-input__control',
    type: revealed ? 'text' : 'password',
    name: options.name,
    placeholder: options.placeholder,
    readonly: options.readOnly,
    ...secretInputAttrs(kind),
    'aria-label': options.label ? undefined : options.ariaLabel,
  });
  input.value = options.value ?? '';
  const revealButton = h('button', { type: 'button', class: cx(INPUT_ACTION_CLASS, 'mh-secret__reveal'), 'aria-label': revealLabel, title: revealLabel, 'aria-pressed': String(revealed) }, createIcon(revealed ? mdiEyeOffOutline : mdiEyeOutline));
  const copyButton = (options.copyable ?? kind === 'key') ? h('button', { type: 'button', class: cx(INPUT_ACTION_CLASS, 'mh-secret__copy'), 'aria-label': copyLabel, title: copyLabel }, createIcon(mdiContentCopy)) : null;
  const status = h('span', { class: 'mh-visually-hidden', role: 'status' });
  const box = h('div', { class: secretFieldClass(options.size, kind) }, options.icon ? inputAdornment(createIcon(options.icon)) : null, input, revealButton, copyButton, status);
  focusOnBoxClick(box, input);

  let copiedTimer: ReturnType<typeof setTimeout> | undefined;
  const sync = (): void => {
    input.type = revealed ? 'text' : 'password';
    revealButton.setAttribute('aria-pressed', String(revealed));
    revealButton.replaceChildren(createIcon(revealed ? mdiEyeOffOutline : mdiEyeOutline));
    revealButton.disabled = disabled;
    if (copyButton) copyButton.disabled = disabled || input.value === '';
  };
  const copy = async (): Promise<boolean> => {
    if (!copyButton || copyButton.disabled) return false;
    const ok = await copyText(input.value);
    status.textContent = ok ? (options.copiedText ?? labels.copied) : (options.copyFailedText ?? labels.failed);
    if (ok) {
      copyButton.classList.add('is-copied');
      copyButton.replaceChildren(createIcon(mdiCheck));
      clearTimeout(copiedTimer);
      copiedTimer = setTimeout(() => {
        copyButton.classList.remove('is-copied');
        copyButton.replaceChildren(createIcon(mdiContentCopy));
        status.textContent = '';
      }, SECRET_COPIED_MS);
    }
    options.onCopy?.(ok);
    return ok;
  };
  revealButton.addEventListener('click', () => {
    revealed = !revealed;
    sync();
    options.onReveal?.(revealed);
  });
  copyButton?.addEventListener('click', () => void copy());
  input.addEventListener('input', (event) => {
    sync();
    options.onInput?.(input.value, event);
  });
  if (options.onChange) input.addEventListener('change', (event) => options.onChange!(input.value, event));

  const field = options.label
    ? createField({ label: options.label, control: box, target: input, helper: options.helper, error: options.error, success: options.success, required: options.required, labelStyle: options.labelStyle })
    : null;

  const handle: SecretFieldHandle = {
    el: field?.el ?? box,
    input,
    field,
    revealButton,
    copyButton,
    getValue: () => input.value,
    setValue(value) {
      input.value = value;
      sync();
    },
    isRevealed: () => revealed,
    setRevealed(value) {
      revealed = value;
      sync();
    },
    copy,
    setError: (text) => field?.setError(text),
    setHelper: (text) => field?.setHelper(text),
    setSuccess: (text) => field?.setSuccess(text),
    setDisabled(value) {
      disabled = value;
      input.disabled = value;
      box.classList.toggle('is-disabled', value);
      field?.setDisabled(value);
      sync();
    },
  };
  sync();
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
