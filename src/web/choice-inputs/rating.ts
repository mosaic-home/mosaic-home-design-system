import { mdiStar, mdiStarOutline } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type RatingTone = 'accent' | 'warning';

export interface RatingOptions {
  /** Accessible name ("Rating", "How was it?"). */
  label: string;
  /** 0 is unrated. Read-only ratings may be fractional (3.5). */
  value?: number;
  /** Number of stars. Default 5. */
  max?: number;
  /** Shows the value without taking input. */
  readOnly?: boolean;
  /** Choosing the current value again clears it to 0. Default true. */
  allowClear?: boolean;
  size?: 'small' | 'medium' | 'large';
  /** Filled colour: the theme accent (default) or the warning amber. */
  tone?: RatingTone;
  /** Filled and empty icons. Default `star` and `star-outline`. */
  icon?: IconName | string;
  emptyIcon?: IconName | string;
  /** The spoken name of one choice. Default "1 star", "2 stars". */
  itemLabel?: (n: number, max: number) => string;
  /** The spoken value of a read-only rating. Default "3.5 out of 5 stars". */
  valueText?: (value: number, max: number) => string;
  name?: string;
  disabled?: boolean;
  onChange?: (value: number, event: Event) => void;
}

export interface RatingHandle {
  el: HTMLDivElement;
  /** The radios of an editable rating (empty when read-only). */
  inputs: HTMLInputElement[];
  getValue(): number;
  setValue(value: number): void;
  setDisabled(disabled: boolean): void;
}

export const ratingItemLabel = (n: number): string => (n === 1 ? '1 star' : `${n} stars`);
export const ratingValueText = (value: number, max: number): string => `${Math.round(value * 10) / 10} out of ${max} stars`;

/** How full star `n` (from 1) is at `value`: 0, 1, or the fraction in between. */
export function ratingFill(value: number, n: number): number {
  return Math.round(Math.min(1, Math.max(0, value - (n - 1))) * 100) / 100;
}

export function ratingClass(o: Pick<RatingOptions, 'readOnly' | 'size' | 'tone' | 'disabled'>): string {
  return cx(
    'mh-rating',
    o.readOnly ? 'mh-rating--readonly' : 'mh-rating--editable',
    o.size === 'small' && 'mh-rating--sm',
    o.size === 'large' && 'mh-rating--lg',
    o.tone === 'warning' && 'mh-rating--warning',
    o.disabled && 'is-disabled',
  );
}

const star = (icon: IconName | string, emptyIcon: IconName | string): HTMLSpanElement =>
  h('span', { class: 'mh-rating__star' }, createIcon(emptyIcon, { class: 'mh-rating__empty' }), createIcon(icon, { class: 'mh-rating__full' }));

/**
 * `.mh-rating`: a row of stars. Editable (`--editable`) it is a radio group, one native radio per star, so arrow
 * keys move and Tab enters on the chosen star; pointer hover previews the choice, and choosing the current star again
 * clears it. Read-only (`--readonly`) it is one `role="img"` with the value spoken ("3.5 out of 5 stars") and stars
 * filled to fractions. Each star's fill is drawn from `--_fill` (0 to 1).
 */
export function createRating(options: RatingOptions): RatingHandle {
  const max = Math.max(1, Math.round(options.max ?? 5));
  const icon = options.icon ?? mdiStar;
  const emptyIcon = options.emptyIcon ?? mdiStarOutline;
  const readOnly = options.readOnly ?? false;
  const clamp = (v: number): number => Math.min(max, Math.max(0, readOnly ? v : Math.round(v)));
  let value = clamp(options.value ?? 0);
  let disabled = options.disabled ?? false;
  const name = options.name ?? uid('mh-rating');
  const inputs: HTMLInputElement[] = [];
  const items = Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    if (readOnly) return h('span', { class: 'mh-rating__item' }, star(icon, emptyIcon));
    const input = h('input', { type: 'radio', class: 'mh-rating__input', name, value: n });
    inputs.push(input);
    return h('label', { class: 'mh-rating__item' }, input, star(icon, emptyIcon), h('span', { class: 'mh-visually-hidden' }, (options.itemLabel ?? ratingItemLabel)(n, max)));
  });
  const el = h('div', { class: ratingClass({ ...options, readOnly, disabled }), role: readOnly ? 'img' : 'radiogroup', 'aria-label': readOnly ? undefined : options.label }, ...items);

  const sync = (): void => {
    items.forEach((item, i) => item.style.setProperty('--_fill', String(ratingFill(value, i + 1))));
    inputs.forEach((input, i) => {
      input.checked = value === i + 1;
      input.disabled = disabled;
    });
    if (readOnly) el.setAttribute('aria-label', `${options.label}: ${(options.valueText ?? ratingValueText)(value, max)}`);
    el.className = ratingClass({ ...options, readOnly, disabled });
  };
  sync();

  inputs.forEach((input, i) => {
    input.addEventListener('click', (event) => {
      const n = i + 1;
      const next = value === n && (options.allowClear ?? true) ? 0 : n;
      if (next === value) return;
      value = next;
      sync();
      options.onChange?.(value, event);
    });
    // Arrow keys move the checked radio; engines that don't send a click for it still send `change`.
    input.addEventListener('change', (event) => {
      if (!input.checked || value === i + 1) return;
      value = i + 1;
      sync();
      options.onChange?.(value, event);
    });
  });

  return {
    el,
    inputs,
    getValue: () => value,
    setValue(next) {
      value = clamp(next);
      sync();
    },
    setDisabled(next) {
      disabled = next;
      sync();
    },
  };
}
