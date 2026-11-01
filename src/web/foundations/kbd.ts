import { cx, h } from '../dom.ts';

export type KbdSize = 'small' | 'medium';

export interface KbdOptions {
  /** One key (`'Esc'`), a chord as a string (`'Ctrl+K'`, `'Ctrl++'`) or as a list (`['Ctrl', 'Shift', 'P']`). */
  keys: string | readonly string[];
  /** The keys are pressed one after another (`G then H`) rather than together. */
  sequence?: boolean;
  /** Word between the keys of a sequence; default "then". */
  thenLabel?: string;
  /** `small` sits inside running text; `medium` (default) stands alone, e.g. in a shortcut list. */
  size?: KbdSize;
}

export interface KbdHandle {
  el: HTMLElement;
  setKeys(keys: string | readonly string[]): void;
}

/** How a key is shown, and what a screen reader should say when the cap is only a symbol. */
export interface KeyCap {
  text: string;
  spoken?: string;
}

const UP: KeyCap = { text: '↑', spoken: 'Up arrow' };
const DOWN: KeyCap = { text: '↓', spoken: 'Down arrow' };
const LEFT: KeyCap = { text: '←', spoken: 'Left arrow' };
const RIGHT: KeyCap = { text: '→', spoken: 'Right arrow' };

const NAMED: Record<string, KeyCap> = {
  control: { text: 'Ctrl' },
  ctrl: { text: 'Ctrl' },
  escape: { text: 'Esc' },
  esc: { text: 'Esc' },
  ' ': { text: 'Space' },
  space: { text: 'Space' },
  spacebar: { text: 'Space' },
  arrowup: UP,
  up: UP,
  arrowdown: DOWN,
  down: DOWN,
  arrowleft: LEFT,
  left: LEFT,
  arrowright: RIGHT,
  right: RIGHT,
  return: { text: 'Enter' },
  delete: { text: 'Del' },
  pageup: { text: 'PgUp' },
  pagedown: { text: 'PgDn' },
};

/** The cap for one key: common names shortened, arrows as symbols with a spoken name, single letters upper-case. */
export function keyCap(key: string): KeyCap {
  const named = NAMED[key.toLowerCase()];
  if (named) return named;
  if (key.length === 1) return { text: key.toUpperCase() };
  return { text: key };
}

/** A chord string split into keys: `'Ctrl+K'` → `['Ctrl', 'K']`; a `+` with nothing before it is the plus key (`'Ctrl++'`). */
export function parseKeys(keys: string | readonly string[]): string[] {
  if (typeof keys !== 'string') return [...keys];
  const out: string[] = [];
  let part = '';
  for (const c of keys) {
    if (c === '+' && part.trim() !== '') {
      out.push(part.trim());
      part = '';
    } else part += c;
  }
  const last = part.trim();
  if (last) out.push(last);
  return out;
}

export function kbdClass(size: KbdSize = 'medium', sequence = false): string {
  return cx('mh-kbd', size === 'small' && 'mh-kbd--sm', sequence && 'mh-kbd--sequence');
}

/** Text between two keys. */
export function kbdSeparator(sequence = false, thenLabel = 'then'): string {
  return sequence ? thenLabel : '+';
}

/**
 * `.mh-kbd`: a keyboard shortcut. One `<kbd>` holds a `.mh-kbd__key` `<kbd>` per key (the HTML way to mark up a
 * key combination) with `.mh-kbd__sep` between them: "+" for a chord, "then" for a sequence. A symbol cap (arrows)
 * carries its spoken name as visually hidden text.
 */
export function createKbd(options: KbdOptions): KbdHandle {
  const el = h('kbd', { class: kbdClass(options.size, options.sequence) });
  const setKeys = (keys: string | readonly string[]): void => {
    el.replaceChildren();
    parseKeys(keys).forEach((key, i) => {
      if (i > 0) el.append(h('span', { class: 'mh-kbd__sep' }, kbdSeparator(options.sequence, options.thenLabel)));
      const cap = keyCap(key);
      el.append(
        cap.spoken
          ? h('kbd', { class: 'mh-kbd__key', title: cap.spoken }, h('span', { 'aria-hidden': 'true' }, cap.text), h('span', { class: 'mh-visually-hidden' }, cap.spoken))
          : h('kbd', { class: 'mh-kbd__key' }, cap.text),
      );
    });
  };
  setKeys(options.keys);
  return { el, setKeys };
}
