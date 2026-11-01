import { cx, h, uid } from '../dom.ts';
import { normalizeSearch, revealOption } from './listbox.ts';
import { focusOnBoxClick, inputClass, type InputSize } from './textField.ts';

/** A completion the command bar offers while typing. */
export interface CommandSuggestion {
  /** The text that replaces the input when the suggestion is taken. */
  value: string;
  /** A short explanation, shown after the value. */
  description?: string;
}

/** Suggestions: a list the bar filters by the typed text, or a function that returns them for the text. */
export type CommandSuggestions = readonly CommandSuggestion[] | ((text: string) => readonly CommandSuggestion[]);

export interface CommandBarOptions {
  /** Accessible name of the input (default "Command"). */
  ariaLabel?: string;
  value?: string;
  placeholder?: string;
  /** The prompt before the text (default `>`). */
  prompt?: string;
  name?: string;
  size?: InputSize;
  disabled?: boolean;
  suggestions?: CommandSuggestions;
  /** Most suggestions shown at once (default 8). */
  maxSuggestions?: number;
  /** Earlier commands, oldest first; Arrow Up and Down walk through them while no suggestions are shown. */
  history?: readonly string[];
  /** Most commands kept (default 50). */
  historySize?: number;
  /** Empties the input after a command is run (default true). */
  clearOnSubmit?: boolean;
  /** Opens the suggestions above the bar, for a bar at the bottom of the screen. */
  openUp?: boolean;
  /** Accessible name of the suggestion list (default "Suggestions"). */
  listLabel?: string;
  onInput?: (value: string) => void;
  /** Enter with non-blank text and no suggestion picked; the command goes into the history. */
  onSubmit?: (command: string) => void;
}

export interface CommandBarHandle {
  el: HTMLDivElement;
  input: HTMLInputElement;
  list: HTMLUListElement;
  getValue(): string;
  setValue(value: string): void;
  setSuggestions(suggestions: CommandSuggestions | undefined): void;
  /** Earlier commands, oldest first. */
  getHistory(): string[];
  setHistory(history: readonly string[]): void;
  /** Runs the current text as Enter would. */
  submit(): void;
  focus(): void;
  setDisabled(disabled: boolean): void;
}

/**
 * The suggestions for typed text: those starting with it first, then those containing it, case and accents
 * ignored; none for empty text or when the only match is the text itself.
 */
export function filterCommandSuggestions(list: readonly CommandSuggestion[], text: string, limit = 8): CommandSuggestion[] {
  const q = normalizeSearch(text);
  if (q === '') return [];
  const starts: CommandSuggestion[] = [];
  const contains: CommandSuggestion[] = [];
  for (const s of list) {
    const v = normalizeSearch(s.value);
    if (v === q) continue;
    if (v.startsWith(q)) starts.push(s);
    else if (v.includes(q) || (s.description && normalizeSearch(s.description).includes(q))) contains.push(s);
  }
  return [...starts, ...contains].slice(0, limit);
}

/** The suggestions to show for the text. */
export function commandSuggestionsFor(source: CommandSuggestions | undefined, text: string, limit = 8): CommandSuggestion[] {
  if (!source) return [];
  return typeof source === 'function' ? source(text).slice(0, limit) : filterCommandSuggestions(source, text, limit);
}

/** History with a command added: blank and repeated commands are not added twice in a row; capped at `size`. */
export function pushHistory(history: readonly string[], command: string, size = 50): string[] {
  const trimmed = command.trim();
  if (trimmed === '' || history.at(-1) === command) return [...history];
  return [...history, command].slice(-size);
}

/** Where Arrow Up / Down lead in the history. `index` counts back from the newest (-1: the text being typed). */
export function historyStep(length: number, index: number, key: 'ArrowUp' | 'ArrowDown'): number {
  if (key === 'ArrowUp') return Math.min(index + 1, length - 1);
  return Math.max(index - 1, -1);
}

export function commandBarClass(open = false, disabled = false, openUp = false): string {
  return cx('mh-command-bar', openUp && 'mh-command-bar--up', open && 'is-open', disabled && 'is-disabled');
}

/** CSS classes for the prompt box. */
export const commandBarBoxClass = (size: InputSize = 'medium'): string => inputClass(size, 'mh-command-bar__box');

/**
 * `.mh-command-bar`: a mono prompt for commands. The input is an ARIA combobox: typing shows matching suggestions
 * in a `__list` listbox (Arrow Down / Up pick, Tab completes, Enter takes the picked one or runs the text, Escape
 * closes, then clears). With no suggestions shown, Arrow Up and Down walk through earlier commands, as in a
 * shell.
 */
export function createCommandBar(options: CommandBarOptions = {}): CommandBarHandle {
  const listId = uid('mh-command-list');
  const limit = options.maxSuggestions ?? 8;
  const historySize = options.historySize ?? 50;
  let source = options.suggestions;
  let history = [...(options.history ?? [])].slice(-historySize);
  let historyIndex = -1;
  let draft = '';
  let shown: CommandSuggestion[] = [];
  let active = -1;
  let disabled = false;

  const input = h('input', {
    class: 'mh-input__control mh-command-bar__input',
    type: 'text',
    name: options.name,
    placeholder: options.placeholder,
    role: 'combobox',
    'aria-label': options.ariaLabel ?? 'Command',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': listId,
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    enterkeyhint: 'go',
  });
  input.value = options.value ?? '';
  const box = h('div', { class: commandBarBoxClass(options.size) }, h('span', { class: 'mh-input__adornment mh-command-bar__prompt', 'aria-hidden': 'true' }, options.prompt ?? '>'), input);
  const list = h('ul', { class: 'mh-command-bar__list', id: listId, role: 'listbox', 'aria-label': options.listLabel ?? 'Suggestions', hidden: true });
  const el = h('div', { class: commandBarClass(false, false, options.openUp) }, box, list);
  focusOnBoxClick(box, input);

  const optionId = (i: number): string => `${listId}-${i}`;
  const render = (): void => {
    const open = shown.length > 0 && !disabled;
    list.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    el.className = commandBarClass(open, disabled, options.openUp);
    list.replaceChildren(
      ...shown.map((s, i) => {
        const li = h(
          'li',
          { class: cx('mh-command-bar__option', i === active && 'is-active'), id: optionId(i), role: 'option', 'aria-selected': String(i === active) },
          h('span', { class: 'mh-command-bar__value' }, s.value),
          s.description ? h('span', { class: 'mh-command-bar__description' }, s.description) : null,
        );
        li.addEventListener('mousedown', (event) => event.preventDefault());
        li.addEventListener('click', () => take(s));
        return li;
      }),
    );
    if (open && active >= 0) {
      input.setAttribute('aria-activedescendant', optionId(active));
      revealOption(list.children[active]);
    } else input.removeAttribute('aria-activedescendant');
  };
  const suggest = (): void => {
    shown = commandSuggestionsFor(source, input.value, limit);
    active = -1;
    render();
  };
  const close = (): void => {
    shown = [];
    active = -1;
    render();
  };
  const fill = (text: string): void => {
    input.value = text;
    input.setSelectionRange?.(text.length, text.length);
    options.onInput?.(text);
  };
  const take = (s: CommandSuggestion): void => {
    fill(s.value);
    close();
    input.focus();
  };
  const submit = (): void => {
    const command = input.value;
    if (disabled || command.trim() === '') return;
    history = pushHistory(history, command, historySize);
    historyIndex = -1;
    draft = '';
    close();
    options.onSubmit?.(command);
    if (options.clearOnSubmit ?? true) fill('');
  };

  input.addEventListener('input', () => {
    historyIndex = -1;
    suggest();
    options.onInput?.(input.value);
  });
  input.addEventListener('blur', close);
  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    const open = shown.length > 0;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (event.altKey) return;
        event.preventDefault();
        if (open) {
          const n = shown.length;
          active = event.key === 'ArrowDown' ? (active + 1) % n : active <= 0 ? n - 1 : active - 1;
          render();
          return;
        }
        if (history.length === 0) return;
        const next = historyStep(history.length, historyIndex, event.key);
        if (next === historyIndex) return;
        if (historyIndex === -1) draft = input.value;
        historyIndex = next;
        fill(next === -1 ? draft : history[history.length - 1 - next]!);
        return;
      }
      case 'Tab':
        if (!open || event.shiftKey) return;
        event.preventDefault();
        take(shown[Math.max(active, 0)]!);
        return;
      case 'Enter':
        event.preventDefault();
        if (open && active >= 0) take(shown[active]!);
        else submit();
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        } else if (input.value !== '') {
          event.preventDefault();
          event.stopPropagation();
          historyIndex = -1;
          fill('');
        }
        return;
    }
  });

  const handle: CommandBarHandle = {
    el,
    input,
    list,
    getValue: () => input.value,
    setValue(value) {
      input.value = value;
      historyIndex = -1;
      close();
    },
    setSuggestions(next) {
      source = next;
      if (document.activeElement === input) suggest();
    },
    getHistory: () => [...history],
    setHistory(next) {
      history = [...next].slice(-historySize);
      historyIndex = -1;
    },
    submit,
    focus: () => input.focus(),
    setDisabled(next) {
      disabled = next;
      input.disabled = next;
      box.classList.toggle('is-disabled', next);
      if (next) close();
      else render();
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
