import { mdiClose, mdiMagnify } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { inputAdornment, focusOnBoxClick, inputClass, type InputSize } from './textField.ts';

export interface SearchFieldOptions {
  /** Accessible name of the input (default "Search"). */
  label?: string;
  value?: string;
  placeholder?: string;
  name?: string;
  size?: InputSize;
  disabled?: boolean;
  /** Accessible name of the clear button (default "Clear search"). */
  clearLabel?: string;
  /** Marks the box as a search landmark (`role="search"`); use for a page's main search only. */
  landmark?: boolean;
  onInput?: (value: string, event: Event) => void;
  /** Enter pressed. */
  onSearch?: (value: string) => void;
  /** The clear button or Escape emptied the field. */
  onClear?: () => void;
}

export interface SearchFieldHandle {
  el: HTMLDivElement;
  input: HTMLInputElement;
  clearButton: HTMLButtonElement;
  getValue(): string;
  setValue(value: string): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for the search box. */
export function searchFieldClass(size: InputSize = 'medium'): string {
  return inputClass(size, 'mh-search');
}

/** CSS classes for the clear button. */
export const SEARCH_CLEAR_CLASS = cx(iconButtonClass('default', 'small'), 'mh-search__clear');

/**
 * `.mh-input.mh-search`: a search input with a leading search icon and a clear button that shows while there is
 * text. Escape clears (and only bubbles when already empty); Enter calls `onSearch`.
 */
export function createSearchField(options: SearchFieldOptions = {}): SearchFieldHandle {
  const input = h('input', {
    class: 'mh-input__control',
    type: 'search',
    name: options.name,
    placeholder: options.placeholder,
    autocomplete: 'off',
    enterkeyhint: 'search',
    'aria-label': options.label ?? 'Search',
  });
  input.value = options.value ?? '';
  const clearButton = h('button', { type: 'button', class: SEARCH_CLEAR_CLASS, 'aria-label': options.clearLabel ?? 'Clear search', title: options.clearLabel ?? 'Clear search' }, createIcon(mdiClose));
  const el = h('div', { class: searchFieldClass(options.size), role: options.landmark ? 'search' : undefined }, inputAdornment(createIcon(mdiMagnify)), input, clearButton);
  focusOnBoxClick(el, input);

  const sync = (): void => {
    clearButton.hidden = input.value === '' || input.disabled;
  };
  const clear = (): void => {
    input.value = '';
    sync();
    input.focus();
    options.onInput?.('', new Event('input'));
    options.onClear?.();
  };
  input.addEventListener('input', (event) => {
    sync();
    options.onInput?.(input.value, event);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value !== '') {
      event.preventDefault();
      event.stopPropagation();
      clear();
    } else if (event.key === 'Enter') {
      options.onSearch?.(input.value);
    }
  });
  clearButton.addEventListener('click', clear);
  sync();

  const handle: SearchFieldHandle = {
    el,
    input,
    clearButton,
    getValue: () => input.value,
    setValue(value) {
      input.value = value;
      sync();
    },
    setDisabled(disabled) {
      input.disabled = disabled;
      el.classList.toggle('is-disabled', disabled);
      sync();
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
