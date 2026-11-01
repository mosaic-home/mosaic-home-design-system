import { mdiClose, mdiMicrophone, mdiPaperclip, mdiSend, mdiStop, mdiWaveform } from '@mdi/js';
import { buttonClass } from '../actions/button.ts';
import { createIconButton, type IconButtonHandle, type IconButtonSize, type IconButtonTone } from '../actions/iconButton.ts';
import { append, cx, h, uid, type Child } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { autoSize } from './textArea.ts';

/**
 * When Enter sends the message. `auto`: on devices whose main pointer is fine (mouse, trackpad) Enter sends and
 * Shift+Enter starts a new line; on touch devices Enter is a new line and the send button sends. `always` and
 * `never` fix it either way. Ctrl/⌘+Enter sends unless `never`.
 */
export type ComposerEnterSends = 'auto' | 'always' | 'never';

/** A mode the next message is sent in, shown as a chip inside the field ("Automation", "Ask about this picture"). */
export interface ComposerMode {
  label: string;
  /** A short explanation, shown after the label in muted text. */
  hint?: string;
  icon?: IconName | string;
  /** Leaves the mode; the chip's close button calls it. */
  onClear(): void;
  /** Accessible name of the close button (default "Clear <label>"). */
  clearLabel?: string;
}

export interface ComposerOptions {
  /** Accessible name of the text area (default "Message"). */
  ariaLabel?: string;
  value?: string;
  placeholder?: string;
  name?: string;
  /** Grows with its text up to this many lines, then scrolls (default 6). */
  maxRows?: number;
  enterSends?: ComposerEnterSends;
  disabled?: boolean;
  /** Shown above the field while disabled ("Not connected"). */
  disabledReason?: string;
  /** Shows a retry button next to the disabled reason. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Before the text: an attach button. */
  leading?: Child | Child[];
  /** After the text: send, microphone, voice (see `createComposerAction`). */
  trailing?: Child | Child[];
  mode?: ComposerMode | null;
  /** Quick replies in a horizontally scrolling row above the field. */
  suggestions?: readonly string[];
  /** Accessible name of the suggestions row (default "Suggestions"). */
  suggestionsLabel?: string;
  onSuggestion?: (text: string) => void;
  onInput?: (value: string, event: Event) => void;
  /**
   * Called with the text when Enter sends (see `enterSends`) or `submit()` is called, if it has any non-blank text
   * and the composer isn't disabled. The composer doesn't clear itself: call `setValue('')` once the message is
   * accepted.
   */
  onSubmit?: (value: string) => void;
}

export interface ComposerHandle {
  el: HTMLDivElement;
  textarea: HTMLTextAreaElement;
  getValue(): string;
  setValue(value: string): void;
  setPlaceholder(text: string | undefined): void;
  /** Disables the composer, with an optional reason line (and the retry button, if `onRetry` was given). */
  setDisabled(disabled: boolean, reason?: string): void;
  setMode(mode: ComposerMode | null | undefined): void;
  setSuggestions(suggestions: readonly string[] | undefined): void;
  /** Sends the current text as Enter would. */
  submit(): void;
  focus(): void;
  /** Re-measures the height (call after the element is shown, if it was hidden when the value was set). */
  resize(): void;
}

/** The kinds of button that go in a composer's slots. */
export type ComposerActionKind = 'send' | 'stop' | 'mic' | 'voice' | 'attach';

export interface ComposerActionStyle {
  icon: string;
  /** Default accessible name. */
  label: string;
  tone: IconButtonTone;
  size: IconButtonSize;
  filled: boolean;
}

/** How each composer button looks: send is the accent filled circle; the others are plain icon buttons. */
export const COMPOSER_ACTIONS: Readonly<Record<ComposerActionKind, ComposerActionStyle>> = {
  send: { icon: mdiSend, label: 'Send', tone: 'accent', size: 'medium', filled: true },
  stop: { icon: mdiStop, label: 'Stop', tone: 'default', size: 'medium', filled: true },
  mic: { icon: mdiMicrophone, label: 'Dictate', tone: 'default', size: 'medium', filled: false },
  voice: { icon: mdiWaveform, label: 'Start a voice conversation', tone: 'default', size: 'medium', filled: false },
  attach: { icon: mdiPaperclip, label: 'Attach', tone: 'default', size: 'medium', filled: false },
};

export interface ComposerActionOptions {
  /** Accessible name; defaults per kind ("Send", "Dictate", ...). */
  label?: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

/** An icon button sized and toned for a composer slot. */
export function createComposerAction(kind: ComposerActionKind, options: ComposerActionOptions = {}): IconButtonHandle {
  const style = COMPOSER_ACTIONS[kind];
  return createIconButton({ ...style, label: options.label ?? style.label, disabled: options.disabled, onClick: options.onClick });
}

/** The keys that matter for deciding whether Enter sends. */
export interface ComposerKey {
  key: string;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  isComposing?: boolean;
}

/** Whether the device's main pointer is fine (mouse, trackpad); `false` without `matchMedia`. */
export function hasFinePointer(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;
}

/** Whether a key press should send the message rather than type a new line. */
export function composerShouldSubmit(enterSends: ComposerEnterSends, key: ComposerKey, finePointer: boolean = hasFinePointer()): boolean {
  if (key.key !== 'Enter' || key.isComposing || enterSends === 'never') return false;
  if (key.shiftKey || key.altKey) return false;
  if (key.ctrlKey || key.metaKey) return true;
  return enterSends === 'always' || finePointer;
}

/** `enterkeyhint` for the text area: a send key when Enter always sends, none when it depends on the device. */
export function composerEnterKeyHint(enterSends: ComposerEnterSends): 'send' | 'enter' | undefined {
  return enterSends === 'always' ? 'send' : enterSends === 'never' ? 'enter' : undefined;
}

export const composerClearLabel = (mode: ComposerMode): string => mode.clearLabel ?? `Clear ${mode.label}`;

export function composerClass(disabled = false, hasMode = false): string {
  return cx('mh-composer', hasMode && 'mh-composer--mode', disabled && 'is-disabled');
}

const slot = (part: 'leading' | 'trailing', content: Child | Child[] | undefined): HTMLDivElement | null => {
  const children = Array.isArray(content) ? content : [content];
  if (!children.some((c) => c !== null && c !== undefined && c !== false)) return null;
  const el = h('div', { class: `mh-composer__${part}` });
  append(el, ...children);
  return el;
};

/**
 * `.mh-composer`: a message input for chat and assistant apps. A text area that grows from one line up to
 * `maxRows`, `__leading` and `__trailing` slots for buttons, an optional `__mode` chip inside the `__field`, an
 * optional `__suggestions` row above it, and a `__notice` with the reason while disabled. The field shows the
 * focus ring while the text area has keyboard focus.
 */
export function createComposer(options: ComposerOptions): ComposerHandle {
  const maxRows = options.maxRows ?? 6;
  const enterSends = options.enterSends ?? 'auto';
  const modeId = uid('mh-composer-mode');
  const reasonId = uid('mh-composer-reason');

  const textarea = h('textarea', {
    class: 'mh-composer__input',
    rows: 1,
    name: options.name,
    placeholder: options.placeholder,
    'aria-label': options.ariaLabel ?? 'Message',
    enterkeyhint: composerEnterKeyHint(enterSends),
  });
  textarea.value = options.value ?? '';

  const row = h('div', { class: 'mh-composer__row' }, slot('leading', options.leading), textarea, slot('trailing', options.trailing));
  const field = h('div', { class: 'mh-composer__field' }, row);
  const reason = h('p', { class: 'mh-composer__reason', id: reasonId, 'aria-live': 'polite' });
  const notice = h('div', { class: 'mh-composer__notice', hidden: true }, reason);
  if (options.onRetry) {
    const retry = h('button', { type: 'button', class: buttonClass('text', 'small') }, h('span', { class: 'mh-button__label' }, options.retryLabel ?? 'Retry'));
    retry.addEventListener('click', () => options.onRetry!());
    notice.append(retry);
  }
  const el = h('div', { class: composerClass() }, notice, field);

  let disabled = false;
  let mode: ComposerMode | null = null;
  let modeEl: HTMLElement | null = null;
  let suggestionsEl: HTMLElement | null = null;
  let suggestionButtons: HTMLButtonElement[] = [];

  const describe = (): void => {
    const ids = [mode && modeId, !notice.hidden && reasonId].filter(Boolean).join(' ');
    if (ids) textarea.setAttribute('aria-describedby', ids);
    else textarea.removeAttribute('aria-describedby');
  };
  const syncClass = (): void => {
    el.className = composerClass(disabled, mode !== null);
  };
  const resize = (): void => {
    if (textarea.isConnected) autoSize(textarea, maxRows);
  };

  // Pressing the field's padding focuses the text, as in other inputs.
  field.addEventListener('mousedown', (event) => {
    if (event.target !== textarea && !(event.target as Element).closest('button')) {
      event.preventDefault();
      textarea.focus();
    }
  });
  textarea.addEventListener('input', (event) => {
    resize();
    options.onInput?.(textarea.value, event);
  });
  const submit = (): void => {
    if (disabled || textarea.value.trim() === '') return;
    options.onSubmit?.(textarea.value);
  };
  textarea.addEventListener('keydown', (event) => {
    if (composerShouldSubmit(enterSends, event)) {
      event.preventDefault();
      submit();
    }
  });
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(resize);

  const handle: ComposerHandle = {
    el,
    textarea,
    getValue: () => textarea.value,
    setValue(value) {
      textarea.value = value;
      resize();
    },
    setPlaceholder(text) {
      if (text) textarea.placeholder = text;
      else textarea.removeAttribute('placeholder');
    },
    setDisabled(value, text) {
      disabled = value;
      textarea.disabled = value;
      for (const b of suggestionButtons) b.disabled = value;
      const shown = value && !!text;
      reason.textContent = shown ? text : '';
      notice.hidden = !shown;
      syncClass();
      describe();
    },
    setMode(next) {
      mode = next ?? null;
      const old = modeEl;
      modeEl = mode ? renderMode(mode, modeId) : null;
      if (old && modeEl) old.replaceWith(modeEl);
      else if (old) old.remove();
      else if (modeEl) field.prepend(modeEl);
      syncClass();
      describe();
    },
    setSuggestions(list) {
      const old = suggestionsEl;
      suggestionButtons = [];
      suggestionsEl = null;
      if (list && list.length > 0) {
        suggestionButtons = list.map((text) => {
          const b = h('button', { type: 'button', class: 'mh-composer__suggestion', disabled }, text);
          b.addEventListener('click', () => options.onSuggestion?.(text));
          return b;
        });
        suggestionsEl = h('div', { class: 'mh-composer__suggestions', role: 'group', 'aria-label': options.suggestionsLabel ?? 'Suggestions' }, ...suggestionButtons);
      }
      if (old && suggestionsEl) old.replaceWith(suggestionsEl);
      else if (old) old.remove();
      else if (suggestionsEl) el.prepend(suggestionsEl);
    },
    submit,
    focus: () => textarea.focus(),
    resize,
  };
  handle.setSuggestions(options.suggestions);
  handle.setMode(options.mode);
  handle.setDisabled(options.disabled ?? false, options.disabledReason);
  return handle;
}

function renderMode(mode: ComposerMode, id: string): HTMLDivElement {
  const clear = h('button', { type: 'button', class: 'mh-composer__mode-clear', 'aria-label': composerClearLabel(mode), title: composerClearLabel(mode) }, createIcon(mdiClose));
  clear.addEventListener('click', () => mode.onClear());
  return h(
    'div',
    { class: 'mh-composer__mode' },
    mode.icon ? createIcon(mode.icon, { class: 'mh-composer__mode-icon' }) : null,
    h('span', { class: 'mh-composer__mode-text', id }, h('span', { class: 'mh-composer__mode-label' }, mode.label), mode.hint ? h('span', { class: 'mh-composer__mode-hint' }, mode.hint) : null),
    clear,
  );
}
