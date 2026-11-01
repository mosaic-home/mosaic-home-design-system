import { mdiCheck, mdiClose } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export interface ChipOptions {
  label: string;
  /** Accessible name when the visible label is abbreviated (e.g. "M" for Monday). */
  ariaLabel?: string;
  icon?: IconName | string;
  /** Makes the chip a toggle button (`aria-pressed`). */
  selectable?: boolean;
  selected?: boolean;
  /** Adds a remove button (not combined with `selectable`). */
  removable?: boolean;
  /** Accessible name of the remove button (default "Remove <label>"). */
  removeLabel?: string;
  disabled?: boolean;
  onToggle?: (selected: boolean, event: MouseEvent) => void;
  onRemove?: (event: MouseEvent) => void;
}

export interface ChipHandle {
  el: HTMLElement;
  /** The toggle button (selectable chips) or the remove button (removable chips). */
  button: HTMLButtonElement | null;
  isSelected(): boolean;
  setSelected(selected: boolean): void;
  setDisabled(disabled: boolean): void;
}

/** CSS classes for a chip. */
export function chipClass(selectable = false, removable = false): string {
  return cx('mh-chip', selectable && 'mh-chip--selectable', removable && !selectable && 'mh-chip--removable');
}

/** The default accessible name of a chip's remove button. */
export const chipRemoveLabel = (label: string): string => `Remove ${label}`;

/**
 * `.mh-chip`: a pill. `--selectable` is a toggle button with a check when pressed (filter chips, weekday
 * pickers); `--removable` carries a remove button (chosen values); plain chips are static labels.
 */
export function createChip(options: ChipOptions): ChipHandle {
  const label = h('span', { class: 'mh-chip__label' }, options.label);
  const icon = options.icon ? createIcon(options.icon) : null;
  let selected = options.selected ?? false;

  if (options.selectable) {
    const el = h('button', { type: 'button', class: chipClass(true), 'aria-pressed': String(selected), 'aria-label': options.ariaLabel, disabled: options.disabled }, createIcon(mdiCheck, { class: 'mh-chip__check' }), icon, label);
    el.addEventListener('click', (event) => {
      selected = !selected;
      el.setAttribute('aria-pressed', String(selected));
      options.onToggle?.(selected, event);
    });
    return {
      el,
      button: el,
      isSelected: () => selected,
      setSelected(value) {
        selected = value;
        el.setAttribute('aria-pressed', String(value));
      },
      setDisabled(disabled) {
        el.disabled = disabled;
      },
    };
  }

  const remove = options.removable
    ? h('button', { type: 'button', class: 'mh-chip__remove', 'aria-label': options.removeLabel ?? chipRemoveLabel(options.ariaLabel ?? options.label), title: options.removeLabel ?? chipRemoveLabel(options.ariaLabel ?? options.label), disabled: options.disabled }, createIcon(mdiClose))
    : null;
  const el = h('span', { class: cx(chipClass(false, options.removable), options.disabled && 'is-disabled') }, icon, label, remove);
  if (remove && options.onRemove) remove.addEventListener('click', options.onRemove);
  return {
    el,
    button: remove,
    isSelected: () => false,
    setSelected() {},
    setDisabled(disabled) {
      if (remove) remove.disabled = disabled;
      el.classList.toggle('is-disabled', disabled);
    },
  };
}

export interface ChipItem {
  value: string;
  label: string;
  ariaLabel?: string;
  icon?: IconName | string;
  disabled?: boolean;
}

export interface ChipGroupOptions {
  /** Accessible name of the group. */
  label: string;
  chips: readonly ChipItem[];
  /** `multiple` (default) or `single` selection; `none` for static or removable chips. */
  selection?: 'multiple' | 'single' | 'none';
  values?: readonly string[];
  /** Chips carry a remove button (with `selection: 'none'`). */
  removable?: boolean;
  onChange?: (values: string[]) => void;
  /** A chip's remove button was pressed; the chip is removed and focus moves to a neighbour. */
  onRemove?: (value: string) => void;
}

export interface ChipGroupHandle {
  el: HTMLDivElement;
  getValues(): string[];
  setValues(values: readonly string[]): void;
}

/**
 * `.mh-chip-group`: a wrapping row of chips. Selectable chips toggle (`single` keeps at most one pressed);
 * removable chips leave the group with focus kept on a neighbouring chip.
 */
export function createChipGroup(options: ChipGroupOptions): ChipGroupHandle {
  const selection = options.selection ?? 'multiple';
  const selectable = selection !== 'none';
  let values = new Set(options.values ?? []);
  const el = h('div', { class: 'mh-chip-group', role: 'group', 'aria-label': options.label, tabindex: options.removable ? '-1' : undefined });
  const chips = new Map<string, ChipHandle>();
  const emit = (): void => options.onChange?.([...values]);

  for (const item of options.chips) {
    const chip = createChip({
      label: item.label,
      ariaLabel: item.ariaLabel,
      icon: item.icon,
      disabled: item.disabled,
      selectable,
      selected: values.has(item.value),
      removable: !selectable && options.removable,
      onToggle(on) {
        if (selection === 'single') {
          values = new Set(on ? [item.value] : []);
          for (const [v, c] of chips) c.setSelected(values.has(v));
        } else if (on) values.add(item.value);
        else values.delete(item.value);
        emit();
      },
      onRemove() {
        const order = [...chips.keys()];
        const at = order.indexOf(item.value);
        chips.get(item.value)?.el.remove();
        chips.delete(item.value);
        const next = chips.get(order[at + 1] ?? '') ?? chips.get(order[at - 1] ?? '');
        (next?.button ?? el).focus();
        options.onRemove?.(item.value);
      },
    });
    chips.set(item.value, chip);
    el.append(chip.el);
  }

  return {
    el,
    getValues: () => [...values],
    setValues(next) {
      values = new Set(next);
      for (const [v, c] of chips) c.setSelected(values.has(v));
    },
  };
}
