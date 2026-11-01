import { mdiMagnify } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createShell, type OverlayCloseReason } from './modal.ts';

export interface Command {
  value: string;
  label: string;
  /** A second line ("Turns off every light downstairs"). */
  description?: string;
  icon?: IconName | string;
  /** Commands with the same group are listed under one heading. */
  group?: string;
  /** Other words that find it ("dark", "night" for "Turn off all lights"). */
  keywords?: readonly string[];
  /** Shown on the right, e.g. "Ctrl+L". Display only. */
  shortcut?: string;
  disabled?: boolean;
}

/** Every visible and spoken word, for translation. */
export interface CommandPaletteLabels {
  /** Accessible name of the dialog. */
  label: string;
  placeholder: string;
  /** Accessible name of the list. */
  list: string;
  empty: string;
  move: string;
  run: string;
  close: string;
  /** Spoken when the results change. */
  results: (count: number) => string;
}

export const COMMAND_PALETTE_LABELS: CommandPaletteLabels = {
  label: 'Command palette',
  placeholder: 'Search commands',
  list: 'Commands',
  empty: 'No matching commands',
  move: 'to move',
  run: 'to run',
  close: 'to close',
  results: (n) => (n === 1 ? '1 command' : `${n} commands`),
};

export interface CommandPaletteOptions {
  commands: readonly Command[];
  onSelect?: (value: string) => void;
  /** Ctrl+K (⌘K on Apple keyboards) anywhere opens and closes it. Default false. */
  hotkey?: boolean;
  labels?: Partial<CommandPaletteLabels>;
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default `document.body`). */
  container?: HTMLElement | null;
  onOpen?: () => void;
  onClose?: (reason: OverlayCloseReason) => void;
}

export interface CommandPaletteHandle {
  el: HTMLDialogElement;
  input: HTMLInputElement;
  open(): void;
  close(): void;
  isOpen(): boolean;
  setCommands(commands: readonly Command[]): void;
  /** Closes it and removes the hotkey listener. */
  destroy(): void;
}

/** A command that matched a query: its score (higher first) and the label ranges to highlight. */
export interface CommandMatch {
  command: Command;
  score: number;
  ranges: [number, number][];
}

const isWordStart = (text: string, at: number): boolean => at === 0 || /[\s\-_/.:]/.test(text[at - 1]!);

/**
 * How well `command` matches `query`: every word of the query must appear in the label, a keyword, the description
 * or the group (or, failing that, as the initials of the label's words, or its letters close together in order). Label matches outrank the rest, and a match at
 * the start of a word outranks one inside it. Null when it doesn't match.
 */
export function matchCommand(query: string, command: Command): CommandMatch | null {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { command, score: 0, ranges: [] };
  const label = command.label.toLowerCase();
  const others = [...(command.keywords ?? []), command.description ?? '', command.group ?? ''].join(' ').toLowerCase();
  let score = 0;
  const ranges: [number, number][] = [];
  for (const word of words) {
    let at = -1;
    // Prefer an occurrence at a word start.
    for (let i = label.indexOf(word); i >= 0; i = label.indexOf(word, i + 1)) {
      if (isWordStart(label, i)) {
        at = i;
        break;
      }
      if (at < 0) at = i;
    }
    if (at >= 0) {
      score += isWordStart(label, at) ? (at === 0 ? 30 : 20) : 10;
      ranges.push([at, at + word.length]);
      continue;
    }
    const other = others.indexOf(word);
    if (other >= 0) {
      score += isWordStart(others, other) ? 6 : 3;
      continue;
    }
    // Letters in order: the initials of the label's words ("tol" for "Turn off lights"), or close together.
    const hits = initials(label, word) ?? closeLetters(label, word);
    if (!hits) return null;
    score += 1;
    for (const i of hits) ranges.push([i, i + 1]);
  }
  if (label.startsWith(query.trim().toLowerCase())) score += 50;
  return { command, score, ranges: mergeRanges(ranges) };
}

/** Where the letters of `word` start successive words of `text`, or null. */
function initials(text: string, word: string): number[] | null {
  const hits: number[] = [];
  let k = 0;
  for (let i = 0; i < text.length && k < word.length; i += 1) {
    if (isWordStart(text, i) && text[i] === word[k]) {
      hits.push(i);
      k += 1;
    }
  }
  return k === word.length ? hits : null;
}

/** Where the letters of `word` appear in order in `text` within a short stretch (at most two letters between), or null. */
function closeLetters(text: string, word: string): number[] | null {
  for (let start = text.indexOf(word[0]!); start >= 0; start = text.indexOf(word[0]!, start + 1)) {
    const hits = [start];
    for (const ch of word.slice(1)) {
      const i = text.indexOf(ch, hits[hits.length - 1]! + 1);
      if (i < 0) return null;
      hits.push(i);
    }
    if (hits[hits.length - 1]! - start + 1 <= word.length + 2) return hits;
  }
  return null;
}

function mergeRanges(ranges: [number, number][]): [number, number][] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else out.push([r[0], r[1]]);
  }
  return out;
}

/** The commands that match `query`, best first (ties keep their order); all of them, in order, for an empty query. */
export function filterCommands(query: string, commands: readonly Command[]): CommandMatch[] {
  const matches = commands.map((c) => matchCommand(query, c)).filter((m): m is CommandMatch => m !== null);
  if (!query.trim()) return matches;
  return matches.map((m, i) => ({ m, i })).sort((a, b) => b.m.score - a.m.score || a.i - b.i).map((x) => x.m);
}

/** A label split into plain and highlighted pieces. */
export function highlightParts(label: string, ranges: readonly [number, number][]): { text: string; mark: boolean }[] {
  const parts: { text: string; mark: boolean }[] = [];
  let at = 0;
  for (const [a, b] of ranges) {
    if (a > at) parts.push({ text: label.slice(at, a), mark: false });
    parts.push({ text: label.slice(a, b), mark: true });
    at = b;
  }
  if (at < label.length) parts.push({ text: label.slice(at), mark: false });
  return parts;
}

/** True for the hotkey that opens a palette: Ctrl+K, or ⌘K. */
export function isPaletteHotkey(e: KeyboardEvent): boolean {
  return e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey;
}

export function commandOptionClass(active: boolean): string {
  return cx('mh-palette__option', active && 'is-active');
}

/**
 * `.mh-overlay.mh-palette`: search every command from the keyboard. A modal `<dialog>` near the top of the screen
 * with a search box (`role="combobox"`) over a `role="listbox"` of commands, grouped under headings until you type,
 * then ranked by how well they match with the matched letters marked. Arrow keys move, Enter runs, Escape closes;
 * the pointer works too. With `hotkey`, Ctrl+K (⌘K) opens it from anywhere. Parts `__panel`, `__search`, `__input`,
 * `__list`, `__group`, `__heading`, `__option`, `__empty`, `__footer`.
 */
export function createCommandPalette(options: CommandPaletteOptions): CommandPaletteHandle {
  const labels = { ...COMMAND_PALETTE_LABELS, ...options.labels };
  const listId = uid('mh-palette-list');
  const input = h('input', {
    type: 'text',
    class: 'mh-palette__input',
    role: 'combobox',
    'aria-expanded': 'true',
    'aria-controls': listId,
    'aria-autocomplete': 'list',
    'aria-label': labels.placeholder,
    placeholder: labels.placeholder,
    autocomplete: 'off',
    spellcheck: 'false',
    enterkeyhint: 'go',
  });
  const list = h('div', { class: 'mh-palette__list', role: 'listbox', id: listId, 'aria-label': labels.list });
  const empty = h('p', { class: 'mh-palette__empty', hidden: true }, labels.empty);
  const status = h('div', { class: 'mh-visually-hidden', role: 'status' });
  const hint = (keys: string[], text: string): HTMLElement => h('span', { class: 'mh-palette__hint' }, ...keys.map((k) => h('kbd', {}, k)), ` ${text}`);
  const shell = createShell({
    block: 'palette',
    label: labels.label,
    closeButton: false,
    container: options.container,
    content: [h('div', { class: 'mh-palette__search' }, createIcon(mdiMagnify, { class: 'mh-palette__search-icon' }), input), list, empty, status],
    footer: [hint(['↑', '↓'], labels.move), hint(['Enter'], labels.run), hint(['Esc'], labels.close)],
    initialFocus: () => input,
    onOpen: options.onOpen,
    onClose: options.onClose,
  });

  let commands = [...options.commands];
  let shown: CommandMatch[] = [];
  let optionEls: HTMLElement[] = [];
  let active = -1;

  const setActive = (index: number, scroll = true): void => {
    active = index;
    optionEls.forEach((o, i) => {
      o.className = commandOptionClass(i === index);
      o.setAttribute('aria-selected', String(i === index));
    });
    const el = optionEls[index];
    if (el) {
      input.setAttribute('aria-activedescendant', el.id);
      if (scroll) el.scrollIntoView?.({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };
  const enabledIndex = (from: number, dir: 1 | -1): number => {
    const n = shown.length;
    for (let k = 0; k < n; k += 1) {
      const i = (((from + dir * k) % n) + n) % n;
      if (!shown[i]!.command.disabled) return i;
    }
    return -1;
  };

  const optionEl = (m: CommandMatch, index: number): HTMLElement => {
    const c = m.command;
    const labelEl = h('span', { class: 'mh-palette__label' }, ...highlightParts(c.label, m.ranges).map((p) => (p.mark ? h('mark', { class: 'mh-palette__mark' }, p.text) : p.text)));
    const o = h(
      'div',
      { class: commandOptionClass(false), role: 'option', id: uid('mh-palette-option'), 'aria-selected': 'false', 'aria-disabled': c.disabled ? 'true' : null, 'data-value': c.value },
      c.icon ? createIcon(c.icon, { class: 'mh-palette__icon' }) : h('span', { class: 'mh-palette__icon' }),
      h('span', { class: 'mh-palette__text' }, labelEl, c.description ? h('span', { class: 'mh-palette__description' }, c.description) : null),
      c.shortcut ? h('kbd', { class: 'mh-palette__shortcut' }, c.shortcut) : null,
    );
    o.addEventListener('pointermove', () => {
      if (!c.disabled && active !== index) setActive(index, false);
    });
    // Keep focus in the search box.
    o.addEventListener('pointerdown', (e) => e.preventDefault());
    o.addEventListener('click', () => run(index));
    return o;
  };

  const render = (): void => {
    const query = input.value;
    shown = filterCommands(query, commands);
    optionEls = [];
    const filtering = query.trim() !== '';
    const nodes: HTMLElement[] = [];
    if (filtering || shown.every((m) => !m.command.group)) {
      for (const m of shown) {
        const o = optionEl(m, optionEls.length);
        optionEls.push(o);
        nodes.push(o);
      }
    } else {
      // Grouped, in the order each group first appears; ungrouped commands first.
      const order: (string | undefined)[] = shown.some((m) => !m.command.group) ? [undefined] : [];
      for (const m of shown) if (m.command.group && !order.includes(m.command.group)) order.push(m.command.group);
      const regrouped: CommandMatch[] = [];
      for (const g of order) {
        const members = shown.filter((m) => (m.command.group || undefined) === g);
        const opts = members.map((m) => {
          const o = optionEl(m, optionEls.length);
          optionEls.push(o);
          regrouped.push(m);
          return o;
        });
        if (g === undefined) nodes.push(...opts);
        else {
          const headId = uid('mh-palette-group');
          nodes.push(h('div', { class: 'mh-palette__group', role: 'group', 'aria-labelledby': headId }, h('div', { class: 'mh-palette__heading', id: headId, role: 'presentation' }, g), ...opts));
        }
      }
      shown = regrouped;
    }
    list.replaceChildren(...nodes);
    empty.hidden = shown.length > 0;
    list.hidden = shown.length === 0;
    status.textContent = filtering ? (shown.length ? labels.results(shown.length) : labels.empty) : '';
    setActive(shown.length ? enabledIndex(0, 1) : -1, false);
    list.scrollTop = 0;
  };

  function run(index: number): void {
    const m = shown[index];
    if (!m || m.command.disabled) return;
    shell.close();
    options.onSelect?.(m.command.value);
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.isComposing) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (shown.length) setActive(enabledIndex(active + 1, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (shown.length) setActive(enabledIndex(active < 0 ? shown.length - 1 : active - 1, -1));
        break;
      case 'PageDown':
      case 'PageUp': {
        e.preventDefault();
        if (!shown.length) break;
        const dir = e.key === 'PageDown' ? 1 : -1;
        const to = Math.min(shown.length - 1, Math.max(0, active + dir * 8));
        setActive(enabledIndex(to, dir));
        break;
      }
      case 'Enter':
        e.preventDefault();
        run(active);
        break;
    }
  });

  const onHotkey = (e: KeyboardEvent): void => {
    if (!isPaletteHotkey(e)) return;
    e.preventDefault();
    if (shell.isOpen()) shell.close();
    else open();
  };
  if (options.hotkey) document.addEventListener('keydown', onHotkey);

  function open(): void {
    if (shell.isOpen()) return;
    input.value = '';
    render();
    shell.open();
  }

  return {
    el: shell.el,
    input,
    open,
    close: () => shell.close(),
    isOpen: shell.isOpen,
    setCommands(next) {
      commands = [...next];
      render();
    },
    destroy() {
      document.removeEventListener('keydown', onHotkey);
      shell.destroy();
    },
  };
}
