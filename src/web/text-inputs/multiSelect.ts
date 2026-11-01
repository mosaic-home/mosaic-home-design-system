import { mdiCheck, mdiChevronDown } from '@mdi/js';
import { createChip } from '../choice-inputs/chip.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { createField, type FieldHandle } from './field.ts';
import { matchesQuery, nextEnabled, revealOption } from './listbox.ts';
import { inputClass, type InputSize } from './textField.ts';

export interface MultiSelectOption {
  value: string;
  label: string;
  /** A second line in the list (not on the chip). */
  description?: string;
  icon?: IconName | string;
  disabled?: boolean;
}

export interface MultiSelectGroup {
  label: string;
  options: readonly MultiSelectOption[];
}

export type MultiSelectItem = MultiSelectOption | MultiSelectGroup;

export const isMultiSelectGroup = (item: MultiSelectItem): item is MultiSelectGroup => 'options' in item;

/** Every option, groups flattened, in list order. */
export function flattenMultiSelect(items: readonly MultiSelectItem[]): MultiSelectOption[] {
  return items.flatMap((item) => (isMultiSelectGroup(item) ? [...item.options] : [item]));
}

/** The items whose label or description matches the query; groups keep their matching options, empty ones go. */
export function filterMultiSelect(items: readonly MultiSelectItem[], query: string): MultiSelectItem[] {
  const hit = (o: MultiSelectOption): boolean => matchesQuery(`${o.label} ${o.description ?? ''}`, query);
  const out: MultiSelectItem[] = [];
  for (const item of items) {
    if (isMultiSelectGroup(item)) {
      const options = item.options.filter(hit);
      if (options.length) out.push({ label: item.label, options });
    } else if (hit(item)) out.push(item);
  }
  return out;
}

/** The values with `value` added (at the end) or removed. */
export function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

/** The id of an option's element: its position in the full list, so it stays the same while filtering. */
export function multiSelectOptionId(listId: string, items: readonly MultiSelectItem[], value: string): string {
  return `${listId}-${flattenMultiSelect(items).findIndex((o) => o.value === value)}`;
}

export function multiSelectClass(open = false, disabled = false): string {
  return cx('mh-multi-select', open && 'is-open', disabled && 'is-disabled');
}

/** CSS classes for the box holding the chips and the filter input. */
export const multiSelectBoxClass = (size: InputSize = 'medium', disabled = false): string => inputClass(size, cx('mh-multi-select__box', disabled && 'is-disabled'));

/** The default texts of a multi-select. */
export const MULTI_SELECT_TEXT = { empty: 'No matches', added: 'added', removed: 'removed' } as const;

/** What the status line announces after a change ("Kitchen added"). */
export const multiSelectAnnouncement = (label: string, added: boolean): string => `${label} ${added ? MULTI_SELECT_TEXT.added : MULTI_SELECT_TEXT.removed}`;

export interface MultiSelectOptions {
  /** Visible label. Without one, pass `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
  options: readonly MultiSelectItem[];
  /** The selected values, in the order they were picked. */
  values?: readonly string[];
  /** Shown in the input while nothing is selected. */
  placeholder?: string;
  /** Shown when nothing matches the typed text (default "No matches"). */
  emptyText?: string;
  /** Adds a hidden input per value with this name, for forms. */
  name?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: InputSize;
  labelStyle?: 'label' | 'eyebrow';
  onChange?: (values: string[]) => void;
}

export interface MultiSelectHandle {
  el: HTMLElement;
  /** The filter input (`role="combobox"`). */
  input: HTMLInputElement;
  list: HTMLDivElement;
  field: FieldHandle | null;
  getValues(): string[];
  setValues(values: readonly string[]): void;
  setOptions(options: readonly MultiSelectItem[]): void;
  open(): void;
  close(): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/**
 * `.mh-multi-select`: picks several options, shown as removable chips in the box. The input is an ARIA combobox
 * that filters a `__popup` listbox (`aria-multiselectable`, groups, icons, descriptions). Arrow keys move, Enter
 * toggles the active option and keeps the list open, Escape closes, Backspace in the empty input removes the
 * last chip, pressing the box opens and closes. Changes are announced in a polite live region.
 */
export function createMultiSelect(options: MultiSelectOptions): MultiSelectHandle {
  const listId = uid('mh-multi-list');
  let items = options.options;
  let values = [...(options.values ?? [])];
  let query = '';
  let open = false;
  let active: string | null = null;
  let disabled = false;

  const input = h('input', {
    class: 'mh-input__control mh-multi-select__input',
    type: 'text',
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': listId,
    'aria-haspopup': 'listbox',
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': options.label ? undefined : options.ariaLabel,
  });
  const chips = h('span', { class: 'mh-multi-select__chips' });
  const box = h('div', { class: multiSelectBoxClass(options.size) }, chips, input, h('span', { class: 'mh-multi-select__chevron' }, createIcon(mdiChevronDown)));
  const list = h('div', { class: 'mh-multi-select__list', id: listId, role: 'listbox', 'aria-multiselectable': 'true', 'aria-label': options.label ?? options.ariaLabel });
  const empty = h('p', { class: 'mh-multi-select__empty' }, options.emptyText ?? MULTI_SELECT_TEXT.empty);
  const popup = h('div', { class: 'mh-multi-select__popup', hidden: true }, list, empty);
  const status = h('span', { class: 'mh-visually-hidden', role: 'status' });
  const hidden = h('span', { hidden: true });
  const el = h('div', { class: multiSelectClass() }, box, popup, status, options.name ? hidden : null);

  const field = options.label ? createField({ label: options.label, control: el, target: input, helper: options.helper, error: options.error, required: options.required, labelStyle: options.labelStyle }) : null;

  // The filter text is never required; the choice is.
  if (options.required) {
    input.required = false;
    input.setAttribute('aria-required', 'true');
  }

  const all = (): MultiSelectOption[] => flattenMultiSelect(items);
  const visible = (): MultiSelectOption[] => flattenMultiSelect(filterMultiSelect(items, query));
  const byValue = (value: string): MultiSelectOption | undefined => all().find((o) => o.value === value);

  const renderOption = (o: MultiSelectOption): HTMLDivElement => {
    const selected = values.includes(o.value);
    const row = h(
      'div',
      { class: cx('mh-multi-select__option', o.value === active && 'is-active'), id: multiSelectOptionId(listId, items, o.value), role: 'option', 'aria-selected': String(selected), 'aria-disabled': o.disabled ? 'true' : undefined },
      h('span', { class: 'mh-multi-select__check' }, createIcon(mdiCheck)),
      o.icon ? createIcon(o.icon, { class: 'mh-multi-select__icon' }) : null,
      h('span', { class: 'mh-multi-select__text' }, h('span', { class: 'mh-multi-select__label' }, o.label), o.description ? h('span', { class: 'mh-multi-select__description' }, o.description) : null),
    );
    row.addEventListener('click', () => {
      if (o.disabled) return;
      active = o.value;
      toggle(o.value);
    });
    return row;
  };
  const render = (): void => {
    chips.replaceChildren(
      ...values.map((v) => {
        const o = byValue(v);
        const chip = createChip({ label: o?.label ?? v, icon: o?.icon, removable: true, disabled });
        chip.button?.addEventListener('click', (event) => {
          event.stopPropagation();
          toggle(v);
          input.focus();
        });
        return chip.el;
      }),
    );
    const filtered = filterMultiSelect(items, query);
    list.replaceChildren(
      ...filtered.map((item, i) => {
        if (!isMultiSelectGroup(item)) return renderOption(item);
        const gid = `${listId}-g${i}`;
        return h('div', { class: 'mh-multi-select__group', role: 'group', 'aria-labelledby': gid }, h('div', { class: 'mh-multi-select__group-label', id: gid, role: 'presentation' }, item.label), ...item.options.map(renderOption));
      }),
    );
    empty.hidden = filtered.length > 0;
    const shown = open && !disabled;
    popup.hidden = !shown;
    el.className = multiSelectClass(shown, disabled);
    box.className = multiSelectBoxClass(options.size, disabled);
    input.setAttribute('aria-expanded', String(shown));
    input.placeholder = values.length === 0 && options.placeholder ? options.placeholder : '';
    if (!input.placeholder) input.removeAttribute('placeholder');
    if (shown && active !== null && visible().some((o) => o.value === active)) {
      const id = multiSelectOptionId(listId, items, active);
      input.setAttribute('aria-activedescendant', id);
      revealOption(list.querySelector(`[id="${id}"]`));
    } else input.removeAttribute('aria-activedescendant');
    if (options.name) hidden.replaceChildren(...values.map((v) => h('input', { type: 'hidden', name: options.name, value: v })));
  };

  const toggle = (value: string): void => {
    const o = byValue(value);
    if (!o || disabled) return;
    const added = !values.includes(value);
    values = toggleValue(values, value);
    if (query) {
      query = '';
      input.value = '';
    }
    status.textContent = multiSelectAnnouncement(o.label, added);
    render();
    options.onChange?.([...values]);
  };
  const outside = (event: PointerEvent): void => {
    if (!el.contains(event.target as Node)) setOpen(false);
  };
  const setOpen = (next: boolean, from: 'first' | 'last' | 'keep' = 'keep'): void => {
    if (disabled) next = false;
    if (next && !open) document.addEventListener('pointerdown', outside, true);
    if (!next && open) document.removeEventListener('pointerdown', outside, true);
    open = next;
    if (next) {
      const v = visible();
      if (from !== 'keep' || !v.some((o) => o.value === active)) {
        const i = from === 'last' ? nextEnabled(v, v.length, -1) : nextEnabled(v, -1, 1);
        active = v[i]?.value ?? null;
      }
    }
    render();
  };
  const move = (delta: 1 | -1): void => {
    const v = visible();
    const i = nextEnabled(v, v.findIndex((o) => o.value === active), delta, true);
    active = v[i]?.value ?? active;
    render();
  };

  box.addEventListener('mousedown', (event) => {
    if ((event.target as Element).closest('button') || disabled) return;
    if (event.target !== input) event.preventDefault();
    input.focus();
    setOpen(!open);
  });
  popup.addEventListener('mousedown', (event) => event.preventDefault());
  input.addEventListener('input', () => {
    query = input.value;
    const v = visible();
    active = v[nextEnabled(v, -1, 1)]?.value ?? null;
    setOpen(true, 'keep');
  });
  input.addEventListener('keydown', (event) => {
    if (event.isComposing || disabled) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) setOpen(true, 'first');
        else move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey) setOpen(false);
        else if (!open) setOpen(true, 'last');
        else move(-1);
        return;
      case 'Enter':
        if (!open) return;
        event.preventDefault();
        if (active !== null && !byValue(active)?.disabled) toggle(active);
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        } else if (query) {
          event.preventDefault();
          event.stopPropagation();
          query = '';
          input.value = '';
          render();
        }
        return;
      case 'Backspace':
        if (input.value === '' && values.length > 0) {
          event.preventDefault();
          toggle(values.at(-1)!);
        }
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
  });
  el.addEventListener('focusout', (event) => {
    if (!el.contains(event.relatedTarget as Node | null)) {
      if (query) {
        query = '';
        input.value = '';
      }
      setOpen(false);
    }
  });

  const handle: MultiSelectHandle = {
    el: field?.el ?? el,
    input,
    list,
    field,
    getValues: () => [...values],
    setValues(next) {
      values = [...next];
      render();
    },
    setOptions(next) {
      items = next;
      render();
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    setError: (text) => field?.setError(text),
    setDisabled(next) {
      disabled = next;
      input.disabled = next;
      field?.setDisabled(next);
      if (next) setOpen(false);
      else render();
    },
  };
  render();
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
