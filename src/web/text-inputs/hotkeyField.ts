import { mdiClose } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';
import { INPUT_ACTION_CLASS } from './secretField.ts';
import { inputClass, type InputSize } from './textField.ts';

/** A keyboard shortcut: one key and the modifiers held with it. */
export interface Hotkey {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
}

/** The parts of a key event a hotkey is read from. */
export interface HotkeyKeyEvent {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

const MODIFIERS = new Set(['Control', 'Alt', 'AltGraph', 'Shift', 'Meta', 'OS', 'Super', 'Hyper', 'Fn', 'FnLock', 'CapsLock', 'NumLock', 'ScrollLock']);
const KEY_NAMES: Record<string, string> = { ' ': 'Space', Spacebar: 'Space', Esc: 'Escape', Del: 'Delete', Left: 'ArrowLeft', Right: 'ArrowRight', Up: 'ArrowUp', Down: 'ArrowDown' };
const KEY_SYMBOLS: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Enter: '↵', Backspace: '⌫', Escape: 'Esc', Delete: 'Del', PageUp: 'PgUp', PageDown: 'PgDn' };

/** Whether the key event is a modifier on its own (Ctrl, Shift, ...). */
export const isModifierKey = (key: string): boolean => MODIFIERS.has(key);

/** The key's stable name: letters and digits by their position (so Alt and Shift don't change them), else `key`. */
export function hotkeyKeyName(event: HotkeyKeyEvent): string {
  const code = event.code ?? '';
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  const key = KEY_NAMES[event.key] ?? event.key;
  return key.length === 1 ? key.toUpperCase() : key;
}

/** The hotkey a key press makes, or `null` for a modifier on its own. */
export function hotkeyFromEvent(event: HotkeyKeyEvent): Hotkey | null {
  if (isModifierKey(event.key) || event.key === 'Dead' || event.key === 'Unidentified' || event.key === '') return null;
  return { key: hotkeyKeyName(event), ctrl: !!event.ctrlKey, alt: !!event.altKey, shift: !!event.shiftKey, meta: !!event.metaKey };
}

const hasModifier = (k: Hotkey): boolean => k.ctrl || k.alt || k.meta || (k.shift && k.key.length > 1);

/** The canonical text of a hotkey: `Ctrl+Alt+Shift+Meta+K`, modifiers in that order. */
export function hotkeyToString(k: Hotkey): string {
  return [k.ctrl && 'Ctrl', k.alt && 'Alt', k.shift && 'Shift', k.meta && 'Meta', k.key].filter(Boolean).join('+');
}

/** Reads canonical text back (`Ctrl+K`); also accepts `Control`, `Option`, `Cmd`, `Command`, `Super`, `Win`. */
export function parseHotkey(text: string): Hotkey | null {
  if (!text) return null;
  const parts = text.split('+');
  // "Ctrl++" is Ctrl and the plus key.
  if (parts.at(-1) === '' && parts.length > 1) {
    parts.splice(-2, 2, '+');
  }
  const out: Hotkey = { key: '', ctrl: false, alt: false, shift: false, meta: false };
  for (const [i, raw] of parts.entries()) {
    const p = raw.trim();
    const lower = p.toLowerCase();
    if (i < parts.length - 1) {
      if (lower === 'ctrl' || lower === 'control') out.ctrl = true;
      else if (lower === 'alt' || lower === 'option') out.alt = true;
      else if (lower === 'shift') out.shift = true;
      else if (['meta', 'cmd', 'command', 'super', 'win'].includes(lower)) out.meta = true;
      else return null;
    } else {
      if (!p) return null;
      out.key = p.length === 1 ? p.toUpperCase() : (KEY_NAMES[p] ?? p);
    }
  }
  return out;
}

/** Whether to show Apple's modifier symbols (⌃ ⌥ ⇧ ⌘). */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** The keycaps to draw for a hotkey. */
export function hotkeyCaps(k: Hotkey, apple = false): string[] {
  const mods = apple ? [k.ctrl && '⌃', k.alt && '⌥', k.shift && '⇧', k.meta && '⌘'] : [k.ctrl && 'Ctrl', k.alt && 'Alt', k.shift && 'Shift', k.meta && 'Meta'];
  return [...mods.filter((m): m is string => !!m), KEY_SYMBOLS[k.key] ?? k.key];
}

/** The hotkey in words, for screen readers ("Command Shift K"). */
export function hotkeySpoken(k: Hotkey, apple = false): string {
  const mods = apple ? [k.ctrl && 'Control', k.alt && 'Option', k.shift && 'Shift', k.meta && 'Command'] : [k.ctrl && 'Control', k.alt && 'Alt', k.shift && 'Shift', k.meta && 'Meta'];
  return [...mods.filter(Boolean), k.key === '+' ? 'Plus' : k.key.replace(/^Arrow/, 'Arrow ')].join(' ');
}

/** What a key press does to a hotkey field. */
export type HotkeyAction =
  | { type: 'ignore' }
  /** Ends recording without a change (Escape, or Tab which also moves focus on). */
  | { type: 'cancel'; leave: boolean }
  /** Removes the shortcut (Backspace or Delete with no modifier). */
  | { type: 'clear' }
  /** Modifiers alone: shows what is held so far. */
  | { type: 'pending'; held: Hotkey }
  /** A key without a modifier where one is required. */
  | { type: 'needs-modifier' }
  | { type: 'set'; hotkey: Hotkey };

/** Decides what a key press does: the shared logic of the web and React hotkey fields. */
export function hotkeyKeyAction(event: HotkeyKeyEvent, recording: boolean, requireModifier = false): HotkeyAction {
  const bare = !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey;
  if (!recording) {
    if (bare && (event.key === 'Backspace' || event.key === 'Delete')) return { type: 'clear' };
    return { type: 'ignore' };
  }
  if (bare && event.key === 'Escape') return { type: 'cancel', leave: false };
  if (event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.metaKey) return { type: 'cancel', leave: true };
  if (bare && (event.key === 'Backspace' || event.key === 'Delete')) return { type: 'clear' };
  const hotkey = hotkeyFromEvent(event);
  if (!hotkey) return { type: 'pending', held: { key: '', ctrl: !!event.ctrlKey, alt: !!event.altKey, shift: !!event.shiftKey, meta: !!event.metaKey } };
  if (requireModifier && !hasModifier(hotkey) && !/^F\d{1,2}$/.test(hotkey.key)) return { type: 'needs-modifier' };
  return { type: 'set', hotkey };
}

export interface HotkeyFieldOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  /** The shortcut as canonical text (`Ctrl+Shift+K`, see `hotkeyToString`); empty for none. */
  value?: string;
  /** Shown when there is no shortcut (default "Not set"). */
  placeholder?: string;
  /** Shown while recording (default "Press a shortcut"). */
  recordingText?: string;
  /** Only accept keys held with Ctrl, Alt or Meta (function keys and Shift with a named key count too). */
  requireModifier?: boolean;
  /** Draw ⌃ ⌥ ⇧ ⌘ (default: on Apple devices). */
  appleSymbols?: boolean;
  /** Shows a clear button while a shortcut is set (default true). */
  clearable?: boolean;
  clearLabel?: string;
  name?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  /** Called with the new shortcut's canonical text, or `''` when cleared. */
  onChange?: (value: string) => void;
}

export interface HotkeyFieldHandle {
  el: HTMLElement;
  /** The button that records. */
  control: HTMLButtonElement;
  field: FieldHandle | null;
  getValue(): string;
  setValue(value: string): void;
  isRecording(): boolean;
  startRecording(): void;
  cancelRecording(): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** The default texts of a hotkey field. */
export const HOTKEY_TEXT = {
  placeholder: 'Not set',
  recording: 'Press a shortcut',
  clear: 'Clear shortcut',
  hint: 'Press Escape to cancel, Backspace to remove.',
  needsModifier: 'Hold Ctrl, Alt or Meta with the key.',
} as const;

/** CSS classes for the hotkey box. */
export function hotkeyFieldClass(size: InputSize = 'medium', recording = false, disabled = false): string {
  return inputClass(size, cx('mh-hotkey', recording && 'is-recording', disabled && 'is-disabled'));
}

/** What the value part of the field shows and says. */
export interface HotkeyDisplay {
  caps: string[];
  /** Text instead of keycaps (placeholder or recording prompt). */
  text: string;
  spoken: string;
  empty: boolean;
}

/** The keycaps or text a hotkey field shows. */
export function hotkeyDisplay(value: string, recording: boolean, held: Hotkey | null, apple: boolean, placeholder: string = HOTKEY_TEXT.placeholder, recordingText: string = HOTKEY_TEXT.recording): HotkeyDisplay {
  if (recording) {
    const caps = held ? hotkeyCaps(held, apple).filter(Boolean) : [];
    return { caps, text: caps.length ? '' : recordingText, spoken: recordingText, empty: false };
  }
  const k = parseHotkey(value);
  if (!k) return { caps: [], text: placeholder, spoken: placeholder, empty: true };
  return { caps: hotkeyCaps(k, apple), text: '', spoken: hotkeySpoken(k, apple), empty: false };
}

function renderKeys(target: HTMLElement, d: HotkeyDisplay): void {
  const visible = d.caps.length
    ? h('span', { class: 'mh-hotkey__caps', 'aria-hidden': 'true' }, ...d.caps.map((c) => h('kbd', { class: 'mh-hotkey__cap' }, c)))
    : h('span', { class: cx('mh-hotkey__text', d.empty && 'mh-hotkey__text--empty'), 'aria-hidden': 'true' }, d.text);
  target.replaceChildren(h('span', { class: 'mh-visually-hidden' }, d.spoken), visible);
}

/**
 * `.mh-input.mh-hotkey` inside a `.mh-field`: records a keyboard shortcut. The value is a button showing the keys
 * as keycaps; pressing it (or Enter / Space) starts recording (`.is-recording`), the next key with its modifiers
 * becomes the shortcut. Escape or leaving cancels, Tab cancels and moves on, Backspace or Delete removes the
 * shortcut. Progress is announced in a polite live region; a clear button sits at the end.
 */
export function createHotkeyField(options: HotkeyFieldOptions): HotkeyFieldHandle {
  const apple = options.appleSymbols ?? isApplePlatform();
  const keysId = uid('mh-hotkey-keys');
  const hintId = uid('mh-hotkey-hint');
  let value = parseHotkey(options.value ?? '') ? hotkeyToString(parseHotkey(options.value ?? '')!) : '';
  let recording = false;
  let held: Hotkey | null = null;
  let disabled = false;
  let swallowKeyUp = false;

  const keys = h('span', { class: 'mh-hotkey__keys', id: keysId });
  const name = options.label ? null : h('span', { class: 'mh-visually-hidden', id: uid('mh-hotkey-name') }, options.ariaLabel ?? 'Shortcut');
  const control = h('button', { type: 'button', class: 'mh-input__control mh-hotkey__control' }, name, keys);
  const formValue = options.name ? h('input', { type: 'hidden', name: options.name }) : null;
  const hint = h('span', { class: 'mh-visually-hidden', id: hintId }, HOTKEY_TEXT.hint);
  const clearLabel = options.clearLabel ?? HOTKEY_TEXT.clear;
  const clear = options.clearable === false ? null : h('button', { type: 'button', class: cx(INPUT_ACTION_CLASS, 'mh-hotkey__clear'), 'aria-label': clearLabel, title: clearLabel }, createIcon(mdiClose));
  const status = h('span', { class: 'mh-visually-hidden', role: 'status' });
  const box = h('div', { class: hotkeyFieldClass(options.size) }, control, clear, hint, status, formValue);

  const field = options.label ? createField({ label: options.label, control: box, target: control, helper: options.helper, error: options.error, required: options.required, labelStyle: options.labelStyle }) : null;
  control.setAttribute('aria-labelledby', `${field ? field.label.id : name!.id} ${keysId}`);
  const describe = (): void => {
    const own = control.getAttribute('aria-describedby')?.split(' ').filter((id) => id && id !== hintId) ?? [];
    control.setAttribute('aria-describedby', [...own, hintId].join(' '));
  };

  const sync = (): void => {
    box.className = hotkeyFieldClass(options.size, recording, disabled);
    renderKeys(keys, hotkeyDisplay(value, recording, held, apple, options.placeholder, options.recordingText));
    if (formValue) formValue.value = value;
    control.disabled = disabled;
    if (clear) clear.hidden = value === '' || recording || disabled;
    describe();
  };
  const announce = (text: string): void => {
    status.textContent = text;
  };
  const stop = (): void => {
    recording = false;
    held = null;
    sync();
  };
  const start = (): void => {
    if (disabled || recording) return;
    recording = true;
    held = null;
    sync();
    announce(`${options.recordingText ?? HOTKEY_TEXT.recording}. ${HOTKEY_TEXT.hint}`);
  };
  const set = (next: string): void => {
    const changed = next !== value;
    value = next;
    stop();
    if (changed) options.onChange?.(value);
  };

  control.addEventListener('click', () => {
    if (recording) return;
    start();
  });
  control.addEventListener('blur', () => {
    if (recording) stop();
  });
  control.addEventListener('keydown', (event) => {
    const action = hotkeyKeyAction(event, recording, options.requireModifier);
    switch (action.type) {
      case 'ignore':
        return;
      case 'cancel':
        if (!action.leave) event.preventDefault();
        event.stopPropagation();
        stop();
        announce('');
        return;
      case 'clear':
        event.preventDefault();
        event.stopPropagation();
        swallowKeyUp = true;
        set('');
        announce(recording ? '' : clearLabel);
        return;
      case 'pending':
        event.preventDefault();
        event.stopPropagation();
        held = action.held;
        renderKeys(keys, hotkeyDisplay(value, true, held, apple, options.placeholder, options.recordingText));
        return;
      case 'needs-modifier':
        event.preventDefault();
        event.stopPropagation();
        announce(HOTKEY_TEXT.needsModifier);
        return;
      case 'set': {
        event.preventDefault();
        event.stopPropagation();
        swallowKeyUp = true;
        set(hotkeyToString(action.hotkey));
        announce(hotkeySpoken(action.hotkey, apple));
        return;
      }
    }
  });
  control.addEventListener('keyup', (event) => {
    // The key that finished recording must not click the button again (Space activates on key up).
    if (swallowKeyUp) {
      event.preventDefault();
      swallowKeyUp = false;
    } else if (recording && isModifierKey(event.key)) {
      held = { key: '', ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey };
      renderKeys(keys, hotkeyDisplay(value, true, held, apple, options.placeholder, options.recordingText));
    }
  });
  clear?.addEventListener('click', () => {
    set('');
    announce(clearLabel);
    control.focus();
  });

  const handle: HotkeyFieldHandle = {
    el: field?.el ?? box,
    control,
    field,
    getValue: () => value,
    setValue(next) {
      const k = parseHotkey(next);
      value = k ? hotkeyToString(k) : '';
      stop();
    },
    isRecording: () => recording,
    startRecording: start,
    cancelRecording: stop,
    setError(text) {
      field?.setError(text);
      describe();
    },
    setDisabled(next) {
      disabled = next;
      if (next) recording = false;
      field?.setDisabled(next);
      sync();
    },
  };
  sync();
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
